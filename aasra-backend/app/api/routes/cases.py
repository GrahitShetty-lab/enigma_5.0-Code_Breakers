"""Case management routes — one case per deceased person."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from app.api.routes.auth import get_current_user

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
        relationship=data.relationship,
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
