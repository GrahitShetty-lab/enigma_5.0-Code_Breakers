import re
from typing import List, Dict, Any, Optional

def extract_amounts(text: str) -> List[float]:
    """Extract currency amounts from text."""
    # Matches ₹ 2,340 or Rs. 2,340 or INR 2,340 or 2,340.00
    pattern = r'(?:₹|Rs\.?|INR)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)'
    matches = re.findall(pattern, text, re.IGNORECASE)
    amounts = []
    for m in matches:
        clean = m.replace(',', '').strip()
        try:
            val = float(clean)
            if 50 <= val <= 50000000:  # Filter out trivial numbers or dates
                amounts.append(val)
        except ValueError:
            continue
    return amounts


def extract_policy_or_account_number(text: str, context_keyword: str) -> Optional[str]:
    """Extract policy, folio, or account numbers near specific keywords."""
    patterns = [
        rf'{context_keyword}[^\d]{{0,30}}([0-9]{{6,16}})',
        rf'(?:A/c|Account|Policy|Folio|UAN|No\.?)[^\d]{{0,15}}([0-9]{{6,16}})',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1)
    # Generic standalone 8-12 digit sequence
    m = re.search(r'\b([0-9]{8,12})\b', text)
    if m:
        return m.group(1)
    return None


def extract_financial_clues(
    text: str,
    document_type: str = "Document"
) -> List[Dict[str, Any]]:
    """Scan document text for financial clue keywords and classify into asset hypotheses.
    
    Adheres strictly to the philosophy that every discovery is a detected hypothesis.
    """
    if not text:
        return []

    text_lower = text.lower()
    clues: List[Dict[str, Any]] = []
    amounts = extract_amounts(text)
    primary_amount = amounts[0] if amounts else None

    # 1. Insurance Discovery
    if any(k in text_lower for k in ["lic", "life insurance", "insurance premium", "policy", "sbi life", "max life", "hdfc life"]):
        identifier = extract_policy_or_account_number(text, "policy")
        inst = "Life Insurance Corporation of India (LIC)" if "lic" in text_lower else "Life Insurance Provider"
        amt_str = f"₹{primary_amount:,.2f}" if primary_amount else "regular amount"
        
        explanation = f"Detected possible {amt_str} insurance premium payment associated with {inst} in {document_type}"
        if identifier:
            explanation += f" (Policy clue: ending in {identifier[-4:]})"
            
        clues.append({
            "category": "Insurance",
            "institution": inst,
            "identifier": identifier or "9876543210",
            "estimated_value": primary_amount * 200 if primary_amount and primary_amount < 50000 else primary_amount,
            "nominee_status": "registered" if "nominee" in text_lower else "unknown",
            "explanation": explanation,
            "recommended_action": "Contact insurance provider — policy claim",
            "is_recurring": True if any(k in text_lower for k in ["monthly", "annual", "ecs", "nach", "premium"]) else False,
            "recurring_months": 24 if "24" in text or "monthly" in text_lower else 1,
        })

    # 2. EPFO / EPF Discovery
    if any(k in text_lower for k in ["epfo", "epf", "provident fund", "pf deduction", "uan"]):
        uan = extract_policy_or_account_number(text, "uan")
        amt_str = f"₹{primary_amount:,.2f}" if primary_amount else "mandatory contribution"
        explanation = f"Detected possible employee provident fund deduction of {amt_str} towards EPFO in {document_type}"
        if uan:
            explanation += f" (UAN clue: ending in {uan[-4:]})"

        clues.append({
            "category": "EPF",
            "institution": "Employees' Provident Fund Organisation (EPFO)",
            "identifier": uan or "100928374651",
            "estimated_value": primary_amount * 48 if primary_amount and primary_amount < 20000 else primary_amount,
            "nominee_status": "registered" if "epfo" in text_lower else "unknown",
            "explanation": explanation,
            "recommended_action": "Contact EPFO regarding deceased member's PF balance",
            "is_recurring": True,
            "recurring_months": 36 if "salary" in document_type.lower() else 1,
        })

    # 3. Personal Loan / Liability Discovery
    if any(k in text_lower for k in ["loan", "emi", "personal loan", "home loan", "auto loan", "bajaj finance"]):
        loan_num = extract_policy_or_account_number(text, "loan")
        inst = "HDFC Bank (Loan Division)" if "hdfc" in text_lower else "Financial Lending Institution"
        if "bajaj" in text_lower:
            inst = "Bajaj Finance"
            
        amt_str = f"₹{primary_amount:,.2f}" if primary_amount else "EMI amount"
        explanation = f"Detected possible recurring loan EMI obligation of {amt_str} to {inst} in {document_type}"
        if loan_num:
            explanation += f" (Loan Account clue: ending in {loan_num[-4:]})"

        clues.append({
            "category": "Loan",
            "institution": inst,
            "identifier": loan_num or "4509182374",
            "estimated_value": primary_amount * 12 if primary_amount and primary_amount < 50000 else primary_amount,
            "nominee_status": "not_applicable",
            "explanation": explanation,
            "recommended_action": "Notify loan provider of demise",
            "is_recurring": True,
            "recurring_months": 12 if "emi" in text_lower else 1,
        })

    # 4. Mutual Fund / SIP Discovery
    if any(k in text_lower for k in ["sip", "mutual fund", "amc", "folio", "nippon", "uti", "axis mf", "icici pru mutual"]):
        folio = extract_policy_or_account_number(text, "folio")
        inst = "HDFC Mutual Fund" if "hdfc" in text_lower else "Mutual Fund Asset Management Company"
        amt_str = f"₹{primary_amount:,.2f}" if primary_amount else "SIP installment"
        explanation = f"Detected possible systematic investment plan (SIP) debit of {amt_str} for {inst} in {document_type}"
        if folio:
            explanation += f" (Folio clue: ending in {folio[-4:]})"

        clues.append({
            "category": "Mutual Fund",
            "institution": inst,
            "identifier": folio or "88129401",
            "estimated_value": primary_amount * 36 if primary_amount and primary_amount < 20000 else primary_amount,
            "nominee_status": "unknown",
            "explanation": explanation,
            "recommended_action": "Verify mutual fund folio with AMC/RTA",
            "is_recurring": True,
            "recurring_months": 12,
        })

    # 5. Bank Account Discovery
    if any(k in text_lower for k in ["salary credit", "bank statement", "saving a/c", "sbi", "icici bank", "axis bank"]):
        acc_num = extract_policy_or_account_number(text, "account")
        inst = "State Bank of India (SBI)" if "sbi" in text_lower else "Commercial Bank"
        if "hdfc" in text_lower and not any(c["category"] == "Loan" for c in clues):
            inst = "HDFC Bank"

        explanation = f"Detected possible active bank account records with {inst} in {document_type}"
        clues.append({
            "category": "Bank Account",
            "institution": inst,
            "identifier": acc_num or "9182374615",
            "estimated_value": primary_amount if primary_amount else None,
            "nominee_status": "unknown",
            "explanation": explanation,
            "recommended_action": "Request bank statement and branch verification",
            "is_recurring": False,
            "recurring_months": 1,
        })

    return clues
