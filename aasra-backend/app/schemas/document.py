from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)
