from sqlalchemy import Column, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    deceased_name = Column(String, nullable=False)
    date_of_death = Column(Date, nullable=False)
    relationship_to_deceased = Column(String, nullable=False)
    state = Column(String, nullable=False)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    assets = relationship("Asset", back_populates="case")
    tasks = relationship("Task", back_populates="case")
