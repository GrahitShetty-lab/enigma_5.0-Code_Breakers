"""Analysis orchestrator — the 'killer demo' endpoint.
POST /api/cases/{case_id}/analyze

This is the one endpoint that has to work end-to-end for the demo:
1. Pull every document on the case that hasn't been analyzed yet
2. Run OCR if extracted_text is empty (falls back gracefully)
3. Run extraction_service to find financial clues
4. Classify each clue into an asset/liability category
5. Run confidence_service to score each finding
6. Upsert asset rows
7. Auto-generate follow-up tasks via task_service
8. Return a summary payload

Every finding is a HYPOTHESIS — the response always says 'detected' or 'possible'."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.models.asset import Asset
from app.schemas.analyze import AnalyzeResponse, ConfidenceBreakdown
from app.schemas.asset import AssetResponse
from app.schemas.task import TaskResponse
from app.api.routes.auth import get_current_user
from app.services.ocr_service import extract_text_from_image
from app.services.extraction_service import extract_financial_clues, _get_next_action
from app.services.confidence_service import compute_confidence
from app.services.task_service import generate_tasks_for_asset
from app.utils import mask_identifier

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analysis"])


@router.post("/api/cases/{case_id}/analyze", response_model=AnalyzeResponse)
def analyze_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The orchestrator — analyzes all unprocessed documents and discovers financial clues.
    
    Returns a summary of detected assets, generated tasks, and confidence breakdowns.
    All findings are hypotheses requiring human verification."""
    
    # 1. Verify case ownership
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    
    # 2. Pull all documents for the case
    documents = db.query(Document).filter(Document.case_id == case_id).all()
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No documents uploaded for this case. Upload evidence before analyzing.",
        )
    
    # 3. OCR pass — try to extract text from docs that don't have it yet
    docs_analyzed = 0
    for doc in documents:
        if not doc.extracted_text:
            extracted = extract_text_from_image(doc.file_url)
            if extracted:
                doc.extracted_text = extracted
                db.add(doc)
                logger.info("OCR text extracted for document %s", doc.id)
        docs_analyzed += 1
    
    # 4. Extraction pass — find financial clues in ALL document texts
    # Aggregate clues across documents, tracking which doc types corroborate each finding
    from collections import defaultdict
    
    # Key: (category, institution) -> {clue data, doc_types, total_occurrences, combined_text}
    aggregated: dict[tuple, dict] = defaultdict(lambda: {
        "clue": None,
        "doc_types": [],
        "total_occurrences": 0,
        "combined_text": "",
        "amounts": [],
        "identifier": None,
        "evidence_doc_id": None,
    })
    
    for doc in documents:
        if not doc.extracted_text:
            continue
        
        clues = extract_financial_clues(doc.extracted_text, doc.document_type)
        
        for clue in clues:
            key = (clue.category, clue.institution)
            entry = aggregated[key]
            entry["clue"] = clue
            entry["doc_types"].append(doc.document_type)
            entry["total_occurrences"] += clue.occurrences
            entry["combined_text"] += "\n" + doc.extracted_text
            entry["amounts"].extend(clue.amounts)
            if clue.identifier and not entry["identifier"]:
                entry["identifier"] = clue.identifier
            if not entry["evidence_doc_id"]:
                entry["evidence_doc_id"] = doc.id
    
    # 5. Confidence scoring + asset upsert
    new_assets = []
    confidence_breakdowns = []
    
    for (category, institution), entry in aggregated.items():
        clue = entry["clue"]
        
        # Compute confidence using the exact formula
        scores = compute_confidence(
            extracted_text=entry["combined_text"],
            amounts_found=len(entry["amounts"]),
            occurrences=entry["total_occurrences"],
            document_types=entry["doc_types"],
            deceased_name=case.deceased_name,
        )
        
        # Build evidence description from real parsed data
        if entry["amounts"]:
            avg_amount = sum(entry["amounts"]) / len(entry["amounts"])
            evidence_desc = (
                f"Possible {category.replace('_', ' ')} with {institution}: "
                f"\u20b9{avg_amount:,.0f} payment detected "
                f"{entry['total_occurrences']} time(s) across {len(set(entry['doc_types']))} document(s)"
            )
        else:
            evidence_desc = (
                f"Possible {category.replace('_', ' ')} with {institution} "
                f"detected in {len(set(entry['doc_types']))} document(s)"
            )
        
        # Upsert: check if this asset already exists for this case
        existing_asset = db.query(Asset).filter(
            Asset.case_id == case_id,
            Asset.category == category,
            Asset.institution == institution,
        ).first()
        
        if existing_asset:
            # Update confidence and evidence
            existing_asset.confidence = scores.final
            existing_asset.evidence_description = evidence_desc
            if entry["identifier"]:
                existing_asset.masked_identifier = entry["identifier"]
            if entry["amounts"]:
                existing_asset.estimated_value = sum(entry["amounts"]) / len(entry["amounts"])
            db.add(existing_asset)
            asset = existing_asset
        else:
            asset = Asset(
                case_id=case_id,
                category=category,
                institution=institution,
                masked_identifier=entry["identifier"],
                estimated_value=sum(entry["amounts"]) / len(entry["amounts"]) if entry["amounts"] else None,
                confidence=scores.final,
                status="detected",
                evidence_document_id=entry["evidence_doc_id"],
                evidence_description=evidence_desc,
            )
            db.add(asset)
            db.flush()  # Get the ID for task generation
        
        new_assets.append(asset)
        
        # Confidence breakdown for the response
        confidence_breakdowns.append(ConfidenceBreakdown(
            category=category,
            institution=institution,
            evidence_quality=scores.evidence_quality,
            repetition=scores.repetition,
            cross_source=scores.cross_source,
            name_match=scores.name_match,
            final_confidence=scores.final,
            label=scores.label,
        ))
    
    # 6. Task generation
    all_tasks = []
    for asset in new_assets:
        tasks = generate_tasks_for_asset(db, asset, case_id, case.deceased_name)
        all_tasks.extend(tasks)
    
    # 7. Update case status
    if new_assets:
        case.status = "in_progress"
        db.add(case)
    
    db.commit()
    
    # 8. Build response
    asset_responses = []
    for asset in new_assets:
        db.refresh(asset)
        asset_responses.append(AssetResponse(
            id=asset.id,
            case_id=asset.case_id,
            category=asset.category,
            institution=asset.institution,
            masked_identifier=mask_identifier(asset.masked_identifier),
            estimated_value=asset.estimated_value,
            nominee_status=asset.nominee_status,
            confidence=asset.confidence,
            status=asset.status,
            evidence_document_id=asset.evidence_document_id,
            evidence_description=asset.evidence_description,
            next_action=_get_next_action(asset.category, asset.institution),
            created_at=asset.created_at,
        ))
    
    task_responses = []
    for task in all_tasks:
        db.refresh(task)
        task_responses.append(TaskResponse.model_validate(task))
    
    logger.info(
        "Analysis complete for case %s: %d assets detected, %d tasks generated",
        case_id, len(asset_responses), len(task_responses)
    )
    
    return AnalyzeResponse(
        documents_analyzed=docs_analyzed,
        assets_found=asset_responses,
        tasks_generated=task_responses,
        confidence_breakdown=confidence_breakdowns,
        message="Analysis complete. All findings are hypotheses requiring human verification.",
    )
