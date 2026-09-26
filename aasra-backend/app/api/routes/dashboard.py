"""Dashboard route — all values computed LIVE from the DB, never hardcoded."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.asset import Asset
from app.models.task import Task
from app.models.claim import Claim
from app.models.document import Document
from app.schemas.dashboard import DashboardResponse
from app.api.routes.auth import get_current_user

router = APIRouter(tags=["dashboard"])

LIABILITY_CATEGORIES = {"loan"}


@router.get("/api/cases/{case_id}/dashboard", response_model=DashboardResponse)
def get_dashboard(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregated case overview — every value computed live from the DB."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    
    # All assets for the case
    assets = db.query(Asset).filter(Asset.case_id == case_id).all()
    
    # Assets vs liabilities
    assets_found = sum(1 for a in assets if a.category not in LIABILITY_CATEGORIES)
    liabilities_found = sum(1 for a in assets if a.category in LIABILITY_CATEGORIES)
    
    # Needs verification (confidence < 0.45 OR status == 'detected')
    needs_verification = sum(
        1 for a in assets if a.confidence < 0.45 or a.status == "detected"
    )
    
    # Tasks
    tasks = db.query(Task).filter(Task.case_id == case_id).all()
    high_priority_tasks = sum(1 for t in tasks if t.priority == "high" and t.status != "completed")
    
    # Claims in progress
    claims_in_progress = (
        db.query(Claim)
        .join(Asset, Claim.asset_id == Asset.id)
        .filter(Asset.case_id == case_id)
        .filter(Claim.status.in_(["submitted", "in_review"]))
        .count()
    )
    
    # Documents missing OCR text
    documents_missing = (
        db.query(Document)
        .filter(Document.case_id == case_id)
        .filter((Document.extracted_text == None) | (Document.extracted_text == ""))
        .count()
    )
    
    # Closure percentage: (completed tasks + verified/closed assets) / (total tasks + total assets)
    total_items = len(tasks) + len(assets)
    resolved_items = (
        sum(1 for t in tasks if t.status == "completed")
        + sum(1 for a in assets if a.status in ("verified", "closed"))
    )
    closure_percentage = int((resolved_items / total_items * 100) if total_items > 0 else 0)
    
    return DashboardResponse(
        assets_found=assets_found,
        liabilities_found=liabilities_found,
        high_priority_tasks=high_priority_tasks,
        claims_in_progress=claims_in_progress,
        documents_missing=documents_missing,
        closure_percentage=closure_percentage,
        needs_verification=needs_verification,
    )
