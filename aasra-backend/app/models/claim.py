from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=generate_uuid)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    institution = Column(String, nullable=False)
    reference_number = Column(String, nullable=True)
    submission_date = Column(Date, nullable=True)
    status = Column(String, default="draft")  # draft, submitted, in_review, approved, rejected, settled
    next_followup = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    asset = relationship("Asset", back_populates="claims")
