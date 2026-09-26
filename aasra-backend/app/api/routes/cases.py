"""Case management and Orchestrator analysis routes.
Every asset discovered is treated as a hypothesis until verified."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.models.asset import Asset
from app.models.task import Task
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.schemas.dashboard import AnalysisResponse, ConfidenceBreakdown
from app.schemas.asset import AssetResponse
from app.schemas.task import TaskResponse
from app.api.routes.auth import get_current_user
from app.services.ocr_service import extract_text_from_file
from app.services.extraction_service import extract_financial_clues
from app.services.confidence_service import (
    score_evidence_quality,
    score_repetition,
    score_cross_source,
    score_identity_match,
    calculate_confidence,
    get_confidence_label,
)
from app.services.task_service import generate_tasks_for_case_assets
from app.utils.masking import mask_identifier

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new case for a deceased family member."""
    case = Case(
        user_id=current_user.id,
        deceased_name=data.deceased_name,
        date_of_death=data.date_of_death,
        relationship_to_deceased=data.relationship_to_deceased,
        state=data.state,
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("", response_model=List[CaseResponse])
def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all cases belonging to the current user."""
    return db.query(Case).filter(Case.user_id == current_user.id).all()


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific case. User must own the case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    data: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a case's details."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)

    db.commit()
    db.refresh(case)
    return case


@router.post("/{case_id}/analyze", response_model=AnalysisResponse)
def analyze_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Orchestrator pipeline:
    1. Pulls documents for the case.
    2. Runs OCR if extracted_text is empty.
    3. Runs extraction_service to discover financial clues (LIC, EPFO, SIP, EMI, loans).
    4. Evaluates evidence and scores confidence (0.4*E + 0.3*R + 0.2*V + 0.1*M).
    5. Upserts asset and liability hypothesis records.
    6. Auto-generates closing follow-up tasks via task_service.
    7. Returns comprehensive analysis summary and confidence breakdown.
    """
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    documents = db.query(Document).filter(Document.case_id == case_id).all()
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No evidence documents uploaded for this case. Upload salary slips, SMS screenshots, or statements first."
        )

    # Step 1: Run OCR on unanalyzed documents
    for doc in documents:
        if not doc.extracted_text or not doc.extracted_text.strip():
            logger.info(f"Running OCR on document {doc.id} ({doc.document_type})")
            ocr_text = extract_text_from_file(doc.file_url)
            if ocr_text:
                doc.extracted_text = ocr_text
                doc.verification_status = "analyzed"
            else:
                doc.verification_status = "ocr_pending"
    db.commit()

    # Step 2: Extract clues across all documents
    all_clues: List[Dict[str, Any]] = []
    combined_corpus = []

    for doc in documents:
        text = doc.extracted_text or ""
        combined_corpus.append(text)
        if text.strip():
            doc_clues = extract_financial_clues(text, document_type=doc.document_type)
            for clue in doc_clues:
                clue["source_doc_id"] = doc.id
                clue["source_doc_type"] = doc.document_type
                clue["text_length"] = len(text)
                all_clues.append(clue)

    full_text = " ".join(combined_corpus)

    # Step 3: Group and score clues, upsert into Asset hypotheses
    upserted_assets: List[Asset] = []
    
    # Map clues by category + institution to measure corroboration
    clue_groups: Dict[str, List[Dict[str, Any]]] = {}
    for c in all_clues:
        key = f"{c['category']}::{c['institution']}"
        clue_groups.setdefault(key, []).append(c)

    for key, group in clue_groups.items():
        primary = group[0]
        category = primary["category"]
        institution = primary["institution"]
        identifier = primary.get("identifier")
        masked = mask_identifier(identifier) if identifier else None

        # Calculate formula variables
        # E: Best document quality in group
        e_scores = [score_evidence_quality(c["source_doc_type"], text_length=c["text_length"]) for c in group]
        E = max(e_scores) if e_scores else 0.50

        # R: Repetition
        r_scores = [
            score_repetition(
                occurrence_count=len(group),
                is_recurring=c.get("is_recurring", False),
                recurring_months=c.get("recurring_months", 1)
            )
            for c in group
        ]
        R = max(r_scores) if r_scores else 0.35

        # V: Cross-source verification
        distinct_sources = len({c["source_doc_id"] for c in group})
        distinct_types = len({c["source_doc_type"] for c in group})
        V = score_cross_source(distinct_sources, distinct_types)

        # M: Identity match against deceased name
        M = score_identity_match(full_text, deceased_name=case.deceased_name, family_names=[current_user.name])

        confidence_val = calculate_confidence(E, R, V, M)

        # Check existing asset
        existing_asset = (
            db.query(Asset)
            .filter(Asset.case_id == case_id, Asset.category == category, Asset.institution == institution)
            .first()
        )

        if existing_asset:
            existing_asset.confidence = confidence_val
            existing_asset.explanation = primary["explanation"]
            existing_asset.recommended_action = primary["recommended_action"]
            if primary.get("estimated_value"):
                existing_asset.estimated_value = primary["estimated_value"]
            if identifier and not existing_asset.identifier:
                existing_asset.identifier = identifier
                existing_asset.masked_identifier = masked
            upserted_assets.append(existing_asset)
        else:
            new_asset = Asset(
                case_id=case_id,
                category=category,
                institution=institution,
                identifier=identifier,
                masked_identifier=masked,
                estimated_value=primary.get("estimated_value"),
                nominee_status=primary.get("nominee_status", "unknown"),
                confidence=confidence_val,
                status="detected",
                evidence_document_id=primary["source_doc_id"],
                explanation=primary["explanation"],
                recommended_action=primary["recommended_action"],
            )
            db.add(new_asset)
            upserted_assets.append(new_asset)

    db.commit()
    for a in upserted_assets:
        db.refresh(a)

    # Step 4: Auto-generate closing tasks for assets
    generated_tasks = generate_tasks_for_case_assets(
        db, case_id=case_id, assets=upserted_assets, assigned_to=current_user.name
    )

    # Step 5: Confidence breakdown
    all_case_assets = db.query(Asset).filter(Asset.case_id == case_id).all()
    high_count = sum(1 for a in all_case_assets if a.confidence >= 0.75)
    med_count = sum(1 for a in all_case_assets if 0.45 <= a.confidence < 0.75)
    low_count = sum(1 for a in all_case_assets if a.confidence < 0.45)

    asset_responses = [AssetResponse.model_validate(a) for a in all_case_assets]
    task_responses = [TaskResponse.model_validate(t) for t in generated_tasks]

    return AnalysisResponse(
        status="success",
        case_id=case_id,
        documents_analyzed=len(documents),
        assets_found=len(all_case_assets),
        tasks_generated=len(generated_tasks),
        confidence_breakdown=ConfidenceBreakdown(
            high_confidence=high_count,
            medium_confidence=med_count,
            needs_verification=low_count,
        ),
        discovered_assets=asset_responses,
        generated_tasks=task_responses,
    )
