import pytest
from app.services.confidence_service import (
    score_evidence_quality,
    score_repetition,
    score_cross_source,
    score_identity_match,
    calculate_confidence,
    get_confidence_label,
)

def test_confidence_formula_exact_math():
    # Test case 1: all 1.0 -> 0.4(1) + 0.3(1) + 0.2(1) + 0.1(1) = 1.0
    score = calculate_confidence(1.0, 1.0, 1.0, 1.0)
    assert score == 1.0
    assert get_confidence_label(score) == "HIGH CONFIDENCE"

    # Test case 2: exact 0.75 threshold
    # 0.4(0.8) + 0.3(0.8) + 0.2(0.7) + 0.1(0.5) = 0.32 + 0.24 + 0.14 + 0.05 = 0.75
    score_75 = calculate_confidence(0.8, 0.8, 0.7, 0.5)
    assert score_75 == 0.75
    assert get_confidence_label(score_75) == "HIGH CONFIDENCE"

    # Test case 3: medium confidence 0.50
    # 0.4(0.6) + 0.3(0.5) + 0.2(0.4) + 0.1(0.3) = 0.24 + 0.15 + 0.08 + 0.03 = 0.50
    score_med = calculate_confidence(0.6, 0.5, 0.4, 0.3)
    assert score_med == 0.50
    assert get_confidence_label(score_med) == "MEDIUM CONFIDENCE"

    # Test case 4: needs verification below 0.45
    # 0.4(0.4) + 0.3(0.3) + 0.2(0.3) + 0.1(0.2) = 0.16 + 0.09 + 0.06 + 0.02 = 0.33
    score_low = calculate_confidence(0.4, 0.3, 0.3, 0.2)
    assert score_low == 0.33
    assert get_confidence_label(score_low) == "NEEDS VERIFICATION"

def test_evidence_quality_scoring():
    # Official salary slip should score >= 0.85
    e_salary = score_evidence_quality("Salary Slip", text_length=300, has_official_header=True)
    assert e_salary >= 0.85

    # SMS screenshot should score lower ~0.60
    e_sms = score_evidence_quality("SMS Screenshot", text_length=100)
    assert 0.50 <= e_sms <= 0.70

def test_repetition_scoring():
    # 24 months recurring -> 1.0
    r_recurring = score_repetition(occurrence_count=24, is_recurring=True, recurring_months=24)
    assert r_recurring == 1.0

    # Single occurrence -> lower
    r_single = score_repetition(occurrence_count=1, is_recurring=False)
    assert r_single <= 0.40

def test_identity_matching():
    text = "Payment received from Rajesh Patil for insurance."
    m_exact = score_identity_match(text, deceased_name="Rajesh Patil")
    assert m_exact >= 0.90

    m_none = score_identity_match("Unrelated transaction statement", deceased_name="Rajesh Patil")
    assert m_none <= 0.35
