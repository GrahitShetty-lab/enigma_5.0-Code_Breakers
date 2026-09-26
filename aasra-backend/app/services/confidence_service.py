"""Confidence scoring engine for discovered assets.
Formula:
    confidence = 0.4*E + 0.3*R + 0.2*V + 0.1*M
Where:
    E = Evidence Quality (0.0 to 1.0)
    R = Transaction Repetition (0.0 to 1.0)
    V = Cross-Source Verification (0.0 to 1.0)
    M = Identity/Name Matching (0.0 to 1.0)

Labels:
    HIGH CONFIDENCE (>= 0.75)
    MEDIUM CONFIDENCE (>= 0.45)
    NEEDS VERIFICATION (< 0.45)

Philosophy:
    Every asset is a hypothesis. Use 'possible'/'detected' language,
    never 'confirmed' or 'balance is'.
"""

def score_evidence_quality(
    document_type: str | None,
    text_length: int = 0,
    has_official_header: bool = False
) -> float:
    """Evaluate quality and reliability of evidence source document (E: 0.0 to 1.0)."""
    doc_type_clean = (document_type or "").strip().lower()
    
    # Official financial documents
    if any(k in doc_type_clean for k in ["salary slip", "payslip", "bank statement", "form 16", "policy document", "epf statement"]):
        base = 0.85
    elif any(k in doc_type_clean for k in ["sms", "screenshot", "alert", "whatsapp"]):
        base = 0.60
    elif any(k in doc_type_clean for k in ["certificate", "card", "pan", "aadhar"]):
        base = 0.75
    else:
        base = 0.40

    if has_official_header:
        base += 0.10
    if text_length > 200:
        base += 0.05

    return min(1.0, max(0.1, round(base, 2)))


def score_repetition(
    occurrence_count: int = 1,
    is_recurring: bool = False,
    recurring_months: int = 1
) -> float:
    """Evaluate whether transaction or deduction repeats over time (R: 0.0 to 1.0)."""
    if is_recurring or recurring_months > 1:
        if recurring_months >= 12:
            return 1.0
        elif recurring_months >= 3:
            return 0.85
        return 0.70
    
    if occurrence_count >= 3:
        return 0.75
    elif occurrence_count == 2:
        return 0.60
    
    return 0.35


def score_cross_source(
    source_document_count: int = 1,
    distinct_document_types: int = 1
) -> float:
    """Evaluate corroboration across independent evidence sources (V: 0.0 to 1.0)."""
    if source_document_count > 1 and distinct_document_types > 1:
        return 0.95
    elif source_document_count > 1:
        return 0.75
    return 0.35


def score_identity_match(
    text: str,
    deceased_name: str | None = None,
    family_names: list[str] | None = None
) -> float:
    """Evaluate name matching in evidence text (M: 0.0 to 1.0)."""
    if not text or not deceased_name:
        return 0.30

    text_lower = text.lower()
    dec_lower = deceased_name.lower().strip()
    
    # Exact full name match
    if dec_lower in text_lower:
        return 0.95

    # Split name into components (first, last)
    parts = [p for p in dec_lower.split() if len(p) > 2]
    if parts:
        matches = sum(1 for p in parts if p in text_lower)
        if matches == len(parts):
            return 0.90
        elif matches > 0:
            return 0.65

    # Check family member names
    if family_names:
        for fname in family_names:
            if fname and fname.lower() in text_lower:
                return 0.60

    return 0.25


def calculate_confidence(
    E: float,
    R: float,
    V: float,
    M: float
) -> float:
    """Calculate overall confidence using exact weighted formula:
    confidence = 0.4*E + 0.3*R + 0.2*V + 0.1*M
    """
    score = (0.4 * E) + (0.3 * R) + (0.2 * V) + (0.1 * M)
    return round(min(1.0, max(0.0, score)), 2)


def get_confidence_label(score: float) -> str:
    """Map numeric score to standard hypothesis confidence label."""
    if score >= 0.75:
        return "HIGH CONFIDENCE"
    elif score >= 0.45:
        return "MEDIUM CONFIDENCE"
    else:
        return "NEEDS VERIFICATION"
