import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.asset import Asset
from app.models.task import Task
from app.models.claim import Claim
from app.models.document import Document
from app.schemas.dashboard import DashboardMetrics
from app.api.routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["dashboard"])

EXPECTED_CORE_DOCUMENTS = ["death certificate", "pan card", "aadhaar card", "bank statement"]


def compute_case_dashboard(case_id: str, db: Session, user_id: str) -> DashboardMetrics:
    """Compute live financial estate discovery and closing metrics for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # 1. Assets vs Liabilities
    assets = db.query(Asset).filter(Asset.case_id == case_id).all()
    assets_found = sum(1 for a in assets if str(a.category) != "Loan")
    liabilities_found = sum(1 for a in assets if str(a.category) == "Loan")

    # 2. High priority open tasks
    high_priority_tasks = (
        db.query(Task)
        .filter(Task.case_id == case_id, Task.priority == "HIGH", Task.status != "completed")
        .count()
    )

    # 3. Claims in progress
    claims_in_progress = (
        db.query(Claim)
        .join(Asset, Claim.asset_id == Asset.id)
        .filter(Asset.case_id == case_id, Claim.status.in_(["draft", "submitted", "under_review", "in_review"]))
        .count()
    )

    # 4. Documents missing
    existing_docs = db.query(Document).filter(Document.case_id == case_id).all()
    doc_types = [str(d.document_type).strip().lower() for d in existing_docs if d.document_type is not None]
    
    missing_count = 0
    for exp in EXPECTED_CORE_DOCUMENTS:
        if not any(exp in dt for dt in doc_types):
            missing_count += 1

    # 5. Needs verification (confidence < 0.45 or status not verified)
    needs_verification = sum(1 for a in assets if float(getattr(a, "confidence", 0.0) or 0.0) < 0.45 or str(a.status) in ["detected", "needs_verification"])

    # 6. Closure percentage (0-100%)
    total_tasks = db.query(Task).filter(Task.case_id == case_id).count()
    completed_tasks = db.query(Task).filter(Task.case_id == case_id, Task.status == "completed").count()

    total_claims = (
        db.query(Claim)
        .join(Asset, Claim.asset_id == Asset.id)
        .filter(Asset.case_id == case_id)
        .count()
    )
    settled_claims = (
        db.query(Claim)
        .join(Asset, Claim.asset_id == Asset.id)
        .filter(Asset.case_id == case_id, Claim.status.in_(["settled", "closed"]))
        .count()
    )

    total_trackable = total_tasks + total_claims + (1 if assets else 0)
    resolved_trackable = completed_tasks + settled_claims + (1 if (assets and needs_verification == 0) else 0)

    if total_trackable == 0:
        closure_percentage = 0
    else:
        closure_percentage = min(100, max(0, int(round((resolved_trackable / total_trackable) * 100))))

    return DashboardMetrics(
        assets_found=assets_found,
        liabilities_found=liabilities_found,
        high_priority_tasks=high_priority_tasks,
        claims_in_progress=claims_in_progress,
        documents_missing=missing_count,
        closure_percentage=closure_percentage,
        needs_verification=needs_verification,
    )


@router.get("/api/cases/{case_id}/dashboard", response_model=DashboardMetrics)
def get_case_dashboard(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve live computed financial discovery and closure metrics for a case."""
    return compute_case_dashboard(case_id, db, str(current_user.id))


@router.get("/api/dashboard/{case_id}", response_model=DashboardMetrics)
def get_dashboard_alias(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alias for /api/cases/{case_id}/dashboard."""
    return compute_case_dashboard(case_id, db, str(current_user.id))
