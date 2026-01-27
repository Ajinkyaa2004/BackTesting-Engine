"""
Binance broker - fetches real OHLC data from Binance API.
"""
import httpx
from typing import List, Dict, Any, Optional
from brokers.base import BrokerBase
from core.candle import Candle


class BinanceBroker(BrokerBase):
    """
    Binance broker implementation.
    
    Fetches real market data from Binance public API.
    No API keys required for public endpoints.
    """
    
    BASE_URL = "https://api.binance.com/api/v3"
    
    def __init__(self):
        """Initialize the Binance broker."""
        self.name = "binance"
    
    def get_name(self) -> str:
        """Get the broker name."""
        return self.name
    
    def get_ohlc(
        self,
        symbol: str,
        interval: str,
        limit: Optional[int] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[Candle]:
        """
        Fetch OHLC data from Binance API.
        
        Args:
            symbol: Trading symbol (e.g., "BTCUSDT", "ETHUSDT")
            interval: Time interval (e.g., "1m", "5m", "1h", "1d")
            limit: Number of candles to return (default: 500, max: 1000)
            start_time: Start timestamp in milliseconds (optional)
            end_time: End timestamp in milliseconds (optional)
            
        Returns:
            List of Candle objects with normalized format
        """
        # Default limit
        if limit is None:
            limit = 500
        elif limit > 1000:
            limit = 1000  # Binance max limit
        
        # Build request parameters
        params = {
            "symbol": symbol.upper(),
            "interval": self._normalize_interval(interval),
            "limit": limit
        }
        
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        try:
            # Make API request
            url = f"{self.BASE_URL}/klines"
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
            
            # Convert Binance format to our standard Candle model
            candles = []
            for candle in data:
                candles.append(Candle(
                    timestamp=int(candle[0]),  # Open time
                    open=float(candle[1]),    # Open price
                    high=float(candle[2]),    # High price
                    low=float(candle[3]),     # Low price
                    close=float(candle[4]),   # Close price
                    volume=float(candle[5])    # Volume
                ))
            
            return candles
            
        except httpx.HTTPStatusError as e:
            raise Exception(f"Binance API error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error connecting to Binance: {str(e)}")
        except Exception as e:
            raise Exception(f"Error fetching Binance data: {str(e)}")
    
    def place_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Place a trading order (not implemented - requires authentication).
        
        Args:
            symbol: Trading symbol
            side: "BUY" or "SELL"
            order_type: "MARKET" or "LIMIT"
            quantity: Order quantity
            price: Limit price (required for LIMIT orders)
            
        Returns:
            Order response dictionary
            
        Raises:
            NotImplementedError: Order placement requires API keys
        """
        raise NotImplementedError(
            "Order placement requires Binance API keys and authentication. "
            "This feature is not implemented in the public endpoint."
        )
    
    def _normalize_interval(self, interval: str) -> str:
        """
        Normalize interval to Binance format.
        
        Args:
            interval: Interval string (e.g., "1h", "5m", "1d")
            
        Returns:
            Binance interval format
        """
        # Binance supports: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
        interval_map = {
            "1m": "1m",
            "3m": "3m",
            "5m": "5m",
            "15m": "15m",
            "30m": "30m",
            "1h": "1h",
            "2h": "2h",
            "4h": "4h",
            "6h": "6h",
            "8h": "8h",
            "12h": "12h",
            "1d": "1d",
            "3d": "3d",
            "1w": "1w",
            "1M": "1M",
        }
        
        # Check if interval is already in Binance format
        if interval in interval_map:
            return interval
        
        # Try to convert common formats
        interval_lower = interval.lower()
        if interval_lower in interval_map:
            return interval_map[interval_lower]
        
        # Default to 1h if not recognized
        return "1h"
