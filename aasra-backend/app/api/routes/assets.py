"""Asset routes — POSSIBLE financial products detected from evidence.
Identifiers are masked by default; 'reveal' query param triggers audit-logged unmasking."""
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
from app.utils import mask_identifier
from app.services.extraction_service import _get_next_action

logger = logging.getLogger(__name__)
router = APIRouter(tags=["assets"])


def _audit_log(db: Session, user_id: str, action: str, resource_type: str, resource_id: str, details: str = None):
    log = AuditLog(user_id=user_id, action=action, resource_type=resource_type, resource_id=resource_id, details=details)
    db.add(log)


def _asset_to_response(asset: Asset, reveal: bool = False) -> AssetResponse:
    """Convert an Asset model to response, masking identifier by default."""
    masked_id = asset.masked_identifier if reveal else mask_identifier(asset.masked_identifier)
    return AssetResponse(
        id=asset.id,
        case_id=asset.case_id,
        category=asset.category,
        institution=asset.institution,
        masked_identifier=masked_id,
        estimated_value=asset.estimated_value,
        nominee_status=asset.nominee_status,
        confidence=asset.confidence,
        status=asset.status,
        evidence_document_id=asset.evidence_document_id,
        evidence_description=asset.evidence_description,
        next_action=_get_next_action(asset.category, asset.institution),
        created_at=asset.created_at,
    )


@router.get("/api/cases/{case_id}/assets", response_model=List[AssetResponse])
def list_assets(
    case_id: str,
    reveal: bool = Query(False, description="Set to true to unmask identifiers (audit-logged)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all detected assets for a case. Identifiers masked by default."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    
    assets = db.query(Asset).filter(Asset.case_id == case_id).all()
    
    if reveal:
        for asset in assets:
            _audit_log(db, current_user.id, "identifier_reveal", "asset", asset.id, f"Revealed identifier for {asset.institution}")
        db.commit()
    
    return [_asset_to_response(a, reveal=reveal) for a in assets]


@router.post("/api/cases/{case_id}/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(
    case_id: str,
    data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually add a possible asset to a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    
    asset = Asset(
        case_id=case_id,
        category=data.category,
        institution=data.institution,
        masked_identifier=data.masked_identifier,
        estimated_value=data.estimated_value,
        nominee_status=data.nominee_status,
        evidence_document_id=data.evidence_document_id,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _asset_to_response(asset)


@router.get("/api/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: str,
    reveal: bool = Query(False, description="Set to true to unmask identifiers (audit-logged)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    
    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    
    if reveal:
        _audit_log(db, current_user.id, "identifier_reveal", "asset", asset.id)
        db.commit()
    
    return _asset_to_response(asset, reveal=reveal)


@router.patch("/api/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: str,
    data: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a detected asset (e.g. after manual verification)."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    
    case = db.query(Case).filter(Case.id == asset.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(asset, field_name, value)
    
    db.commit()
    db.refresh(asset)
    return _asset_to_response(asset)
