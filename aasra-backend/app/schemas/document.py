from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: str
    case_id: str
    document_type: str
    file_url: str
    extracted_text: Optional[str] = None
    verification_status: str
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True
