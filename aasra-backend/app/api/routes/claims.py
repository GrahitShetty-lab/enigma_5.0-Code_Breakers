import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.asset import Asset
from app.models.claim import Claim
from app.schemas.claim import ClaimCreate, ClaimUpdate, ClaimResponse
from app.api.routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["claims"])


@router.post("/api/assets/{asset_id}/claims", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def create_claim(
    asset_id: str,
    data: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """File or track a formal claim against an identified asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    institution = data.institution or asset.institution

    claim = Claim(
        asset_id=asset_id,
        institution=institution,
        reference_number=data.reference_number,
        submission_date=data.submission_date,
        status=data.status or "draft",
        next_followup=data.next_followup,
        notes=data.notes,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.get("/api/cases/{case_id}/claims", response_model=List[ClaimResponse])
def list_case_claims(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all claims in progress or completed for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Get all claims associated with any asset in this case
    claims = (
        db.query(Claim)
        .join(Asset, Claim.asset_id == Asset.id)
        .filter(Asset.case_id == case_id)
        .all()
    )
    return claims


@router.patch("/api/claims/{claim_id}", response_model=ClaimResponse)
def update_claim(
    claim_id: str,
    data: ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update claim status (e.g. submitted, settled), next followup date, or notes."""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    asset = db.query(Asset).filter(Asset.id == claim.asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated asset not found")
    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(claim, field, value)

    db.commit()
    db.refresh(claim)
    return claim
