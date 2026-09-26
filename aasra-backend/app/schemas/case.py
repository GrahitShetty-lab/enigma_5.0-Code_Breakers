from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class CaseBase(BaseModel):
    deceased_name: str
    date_of_death: date
    relationship_to_deceased: str
    state: str

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    deceased_name: Optional[str] = None
    date_of_death: Optional[date] = None
    relationship_to_deceased: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
