"""
Strategy model for storing uploaded strategy code.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from models.base import BaseModel


class Strategy(BaseModel):
    """
    Strategy model - stores uploaded strategy code.
    """
    __tablename__ = "strategies"
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    code = Column(Text, nullable=False)  # Python code as string
    class_name = Column(String(255), nullable=False)  # Class name to load
    is_active = Column(Boolean, default=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="strategies")
    
    def __repr__(self):
        return f"<Strategy(id={self.id}, name='{self.name}', class_name='{self.class_name}')>"
