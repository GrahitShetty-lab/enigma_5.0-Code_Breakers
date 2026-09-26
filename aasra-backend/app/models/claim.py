from sqlalchemy import Column, String, DateTime, ForeignKey
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
    
    asset = relationship("Asset", back_populates="claims")
