"""
Candle model for market data normalization.
All brokers must convert their data to this format.
"""
from pydantic import BaseModel, Field
from typing import Optional


class Candle(BaseModel):
    """
    Standardized candle/OHLC data model.
    
    All brokers (Binance, Fyers, etc.) must convert their
    raw data to this format before returning.
    
    This ensures:
    - Type safety
    - Data validation
    - Consistent structure across all brokers
    """
    timestamp: int = Field(..., description="Timestamp in milliseconds")
    open: float = Field(..., description="Open price", gt=0)
    high: float = Field(..., description="High price", gt=0)
    low: float = Field(..., description="Low price", gt=0)
    close: float = Field(..., description="Close price", gt=0)
    volume: float = Field(..., description="Volume", ge=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": 1706284800000,
                "open": 43250.50,
                "high": 43500.00,
                "low": 43100.00,
                "close": 43350.75,
                "volume": 1234.56
            }
        }
