"""Document upload and retrieval routes.
Every document access is audit-logged. Accepts PDF, JPG, PNG only."""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.config import get_settings
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.schemas.document import DocumentResponse
from app.api.routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["documents"])

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


def _audit_log(db: Session, user_id: str, action: str, resource_type: str, resource_id: str, details: str = None):
    """Write a lightweight audit log entry."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )
    db.add(log)


@router.post("/api/cases/{case_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an evidence document (PDF, JPG, PNG only). Access is audit-logged."""
    # Verify case ownership
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Validate file type
    content_type = file.content_type
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{content_type}' not allowed. Accepted: PDF, JPG, PNG",
        )

    # Save file
    settings = get_settings()
    ext = ALLOWED_TYPES[content_type]
    filename = f"{uuid.uuid4()}{ext}"
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    doc = Document(
        case_id=case_id,
        document_type=document_type,
        file_url=file_path,
        uploaded_by=current_user.id,
    )
    db.add(doc)

    # Audit log
    _audit_log(db, current_user.id, "document_upload", "document", doc.id, f"type={document_type}")

    db.commit()
    db.refresh(doc)

    logger.info("Document uploaded: %s (type=%s, case=%s)", doc.id, document_type, case_id)
    return doc


@router.get("/api/cases/{case_id}/documents", response_model=List[DocumentResponse])
def list_documents(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    docs = db.query(Document).filter(Document.case_id == case_id).all()

    # Audit log each access
    for doc in docs:
        _audit_log(db, current_user.id, "document_access", "document", doc.id)
    db.commit()

    return docs


@router.get("/api/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific document. Access is audit-logged."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Verify case ownership
    case = db.query(Case).filter(Case.id == doc.case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    _audit_log(db, current_user.id, "document_access", "document", doc.id)
    db.commit()

    return doc
