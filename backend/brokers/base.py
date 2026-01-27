"""
Abstract base class for all brokers.
All brokers must implement this interface.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from core.candle import Candle


class BrokerBase(ABC):
    """
    Abstract base class for all broker implementations.
    
    This ensures all brokers (Binance, Fyers, etc.)
    implement the same interface, allowing strategies to work
    with any broker without knowing the implementation details.
    """
    
    @abstractmethod
    def get_ohlc(
        self,
        symbol: str,
        interval: str,
        limit: Optional[int] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[Candle]:
        """
        Fetch OHLC (Open, High, Low, Close) data for a symbol.
        
        Args:
            symbol: Trading symbol (e.g., "BTCUSDT", "NSE:RELIANCE")
            interval: Time interval (e.g., "1m", "5m", "1h", "1d")
            limit: Maximum number of candles to return (optional)
            start_time: Start timestamp in milliseconds (optional)
            end_time: End timestamp in milliseconds (optional)
            
        Returns:
            List of Candle objects with normalized format:
            - timestamp: int (milliseconds)
            - open: float
            - high: float
            - low: float
            - close: float
            - volume: float
        """
        pass
    
    @abstractmethod
    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Place a trading order.
        
        Args:
            symbol: Trading symbol
            side: "BUY" or "SELL"
            order_type: "MARKET", "LIMIT", etc.
            quantity: Order quantity
            price: Limit price (required for LIMIT orders)
            
        Returns:
            Dictionary with order details:
            - order_id: str
            - symbol: str
            - side: str
            - status: str
            - filled_quantity: float
            - price: float
        """
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        """
        Get the broker name.
        
        Returns:
            Broker name (e.g., "binance", "fyers")
        """
        pass
