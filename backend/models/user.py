"""
User model for authentication.
"""
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from models.base import BaseModel


class User(BaseModel):
    """
    User model with email and password.
    """
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    strategies = relationship("Strategy", back_populates="user")
