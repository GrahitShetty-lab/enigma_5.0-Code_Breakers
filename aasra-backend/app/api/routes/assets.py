import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.models.asset import Asset
from app.models.audit_log import AuditLog
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.api.routes.auth import get_current_user
from app.utils.masking import mask_identifier

logger = logging.getLogger(__name__)
router = APIRouter(tags=["assets"])


def _audit_log(db: Session, user_id: str, action: str, resource_type: str, resource_id: str, details: str = None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )
    db.add(log)


def _to_asset_response(asset: Asset, reveal: bool = False) -> AssetResponse:
    resp = AssetResponse.model_validate(asset)
    if reveal:
        resp.revealed_identifier = asset.identifier
    else:
        resp.revealed_identifier = None
    return resp


@router.get("/api/cases/{case_id}/assets", response_model=List[AssetResponse])
def list_case_assets(
    case_id: str,
    reveal: bool = Query(False, description="Reveal unmasked identifier (access is audit-logged)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all assets/liabilities discovered for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    assets = db.query(Asset).filter(Asset.case_id == case_id).all()

    if reveal:
        _audit_log(db, current_user.id, "reveal_identifiers", "case_assets", case_id, f"count={len(assets)}")
        db.commit()

    return [_to_asset_response(a, reveal=reveal) for a in assets]


@router.post("/api/cases/{case_id}/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(
    case_id: str,
    data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually add an asset/liability hypothesis to a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    masked = mask_identifier(data.identifier) if data.identifier else None

    asset = Asset(
        case_id=case_id,
        category=data.category,
        institution=data.institution,
        identifier=data.identifier,
        masked_identifier=masked,
        estimated_value=data.estimated_value,
        nominee_status=data.nominee_status or "unknown",
        confidence=data.confidence if data.confidence is not None else 0.0,
        status=data.status or "detected",
        evidence_document_id=data.evidence_document_id,
        explanation=data.explanation,
        recommended_action=data.recommended_action,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _to_asset_response(asset, reveal=False)


@router.get("/api/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: str,
    reveal: bool = Query(False, description="Reveal unmasked identifier (access is audit-logged)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single asset detail. Reveal param is audit logged."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    if reveal:
        _audit_log(db, current_user.id, "reveal_identifier", "asset", asset_id)
        db.commit()

    return _to_asset_response(asset, reveal=reveal)


@router.patch("/api/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: str,
    data: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update asset status, value, explanation or other details."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    update_dict = data.model_dump(exclude_unset=True)
    if "identifier" in update_dict and update_dict["identifier"] is not None:
        asset.masked_identifier = mask_identifier(update_dict["identifier"])

    for field, value in update_dict.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return _to_asset_response(asset, reveal=False)
