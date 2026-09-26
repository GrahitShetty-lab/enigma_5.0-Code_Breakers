from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import Optional

class AssetBase(BaseModel):
    category: str
    institution: str
    estimated_value: Optional[float] = None
    nominee_status: Optional[str] = "unknown"
    status: Optional[str] = "detected"
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None

class AssetCreate(AssetBase):
    identifier: Optional[str] = None
    evidence_document_id: Optional[str] = None
    confidence: Optional[float] = 0.0

class AssetUpdate(BaseModel):
    category: Optional[str] = None
    institution: Optional[str] = None
    identifier: Optional[str] = None
    estimated_value: Optional[float] = None
    nominee_status: Optional[str] = None
    status: Optional[str] = None
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    confidence: Optional[float] = None

class AssetResponse(AssetBase):
    id: str
    case_id: str
    masked_identifier: Optional[str] = None
    revealed_identifier: Optional[str] = None  # Populated only if reveal=true explicitly
    confidence: float = 0.0
    evidence_document_id: Optional[str] = None
    created_at: datetime

    @computed_field
    @property
    def confidence_label(self) -> str:
        if self.confidence >= 0.75:
            return "HIGH CONFIDENCE"
        elif self.confidence >= 0.45:
            return "MEDIUM CONFIDENCE"
        else:
            return "NEEDS VERIFICATION"

    class Config:
        from_attributes = True
