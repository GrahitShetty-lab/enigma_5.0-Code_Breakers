from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "MEDIUM"
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = "pending"

class TaskCreate(TaskBase):
    asset_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

class TaskAssign(BaseModel):
    assigned_to: str

class TaskResponse(TaskBase):
    id: str
    case_id: str
    asset_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
