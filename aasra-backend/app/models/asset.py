from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    category = Column(String, nullable=False)  # Insurance, EPF, Loan, Bank Account, Mutual Fund
    institution = Column(String, nullable=False)  # LIC, EPFO, HDFC Bank, SBI, etc.
    identifier = Column(String, nullable=True)  # Raw account / policy number
    masked_identifier = Column(String, nullable=True)  # Last 4 digits only
    estimated_value = Column(Float, nullable=True)
    nominee_status = Column(String, default="unknown")  # registered, not_registered, unknown
    confidence = Column(Float, default=0.0)  # 0.0 to 1.0
    status = Column(String, default="detected")  # detected, verified, disputed, closed
    evidence_document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    explanation = Column(Text, nullable=True)  # Plain language explanation of evidence
    recommended_action = Column(String, nullable=True)  # Plain language next step
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    case = relationship("Case", back_populates="assets")
    evidence_document = relationship("Document")
    claims = relationship("Claim", back_populates="asset", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="asset")
