"""
Broker API endpoints.
"""
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Dict, Any
from brokers.factory import BrokerFactory


router = APIRouter(prefix="/brokers", tags=["Brokers"])


@router.get("/available")
async def get_available_brokers() -> Dict[str, Any]:
    """
    Get list of available brokers.
    
    Returns:
        Dictionary containing available brokers and their status
    """
    try:
        # Get available brokers from factory
        available_brokers = ["binance"]  # Currently only Binance is implemented
        
        return {
            "brokers": available_brokers,
            "count": len(available_brokers),
            "default": "binance"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get available brokers: {str(e)}"
        )


@router.get("/ohlc")
async def get_ohlc(
    broker: str = Query(..., description="Broker name (e.g., 'binance')"),
    symbol: str = Query(..., description="Trading symbol (e.g., 'BTCUSDT')"),
    interval: str = Query(..., description="Time interval (e.g., '1h', '1d', '5m')"),
    limit: Optional[int] = Query(None, description="Number of candles to return (default: 100)"),
    start_time: Optional[int] = Query(None, description="Start timestamp in milliseconds"),
    end_time: Optional[int] = Query(None, description="End timestamp in milliseconds")
) -> Dict[str, Any]:
    """
    Get OHLC (Open, High, Low, Close) data from a broker.
    
    Args:
        broker: Broker name (e.g., "binance")
        symbol: Trading symbol (e.g., "BTCUSDT")
        interval: Time interval (e.g., "1h", "1d", "5m")
        limit: Maximum number of candles (optional)
        start_time: Start timestamp in milliseconds (optional)
        end_time: End timestamp in milliseconds (optional)
        
    Returns:
        Dictionary containing:
        - broker: Broker name
        - symbol: Trading symbol
        - interval: Time interval
        - candles: List of candle data
    """
    try:
        # Create broker instance using factory
        broker_instance = BrokerFactory.create_broker(broker)
        
        # Fetch OHLC data
        candles = broker_instance.get_ohlc(
            symbol=symbol,
            interval=interval,
            limit=limit,
            start_time=start_time,
            end_time=end_time
        )
        
        return {
            "broker": broker_instance.get_name(),
            "symbol": symbol,
            "interval": interval,
            "candles": candles,
            "count": len(candles)
        }
        
    except ValueError as e:
        # Broker not found or invalid parameters
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Other errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching OHLC data: {str(e)}"
        )


@router.get("/available")
async def get_available_brokers() -> Dict[str, Any]:
    """
    Get list of available brokers.
    
    Returns:
        Dictionary containing list of available broker names
    """
    brokers = BrokerFactory.get_available_brokers()
    return {
        "brokers": brokers,
        "count": len(brokers)
    }
