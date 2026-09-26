from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class ClaimBase(BaseModel):
    institution: str
    reference_number: Optional[str] = None
    submission_date: Optional[date] = None
    status: Optional[str] = "draft"
    next_followup: Optional[date] = None
    notes: Optional[str] = None

class ClaimCreate(BaseModel):
    institution: Optional[str] = None  # If not provided, can default to asset institution
    reference_number: Optional[str] = None
    submission_date: Optional[date] = None
    status: Optional[str] = "draft"
    next_followup: Optional[date] = None
    notes: Optional[str] = None

class ClaimUpdate(BaseModel):
    institution: Optional[str] = None
    reference_number: Optional[str] = None
    submission_date: Optional[date] = None
    status: Optional[str] = None
    next_followup: Optional[date] = None
    notes: Optional[str] = None

class ClaimResponse(ClaimBase):
    id: str
    asset_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
