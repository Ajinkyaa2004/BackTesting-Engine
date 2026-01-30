"""
Base SQLAlchemy models with common fields.
"""
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from db.database import Base


class BaseModel(Base):
    """
    Abstract base model with common fields.
    All models should inherit from this.
    """
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
