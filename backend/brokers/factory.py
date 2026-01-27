"""
Broker factory - creates broker instances based on broker name.
Uses factory pattern for centralized broker creation.
"""
from typing import Optional
from brokers.base import BrokerBase
from brokers.binance import BinanceBroker


class BrokerFactory:
    """
    Factory class for creating broker instances.
    
    This centralizes broker creation logic and makes it easy
    to add new brokers in the future (Fyers, etc.).
    """
    
    # Registry of available brokers
    _brokers = {
        "binance": BinanceBroker,
        # Future brokers will be added here:
        # "fyers": FyersBroker,
    }
    
    @classmethod
    def create_broker(cls, broker_name: str) -> BrokerBase:
        """
        Create a broker instance by name.
        
        Args:
            broker_name: Name of the broker (e.g., "binance")
            
        Returns:
            Broker instance implementing BrokerBase
            
        Raises:
            ValueError: If broker name is not supported
        """
        broker_name_lower = broker_name.lower()
        
        if broker_name_lower not in cls._brokers:
            available = ", ".join(cls._brokers.keys())
            raise ValueError(
                f"Broker '{broker_name}' is not supported. "
                f"Available brokers: {available}"
            )
        
        broker_class = cls._brokers[broker_name_lower]
        return broker_class()
    
    @classmethod
    def get_available_brokers(cls) -> list[str]:
        """
        Get list of available broker names.
        
        Returns:
            List of available broker names
        """
        return list(cls._brokers.keys())
    
    @classmethod
    def is_broker_available(cls, broker_name: str) -> bool:
        """
        Check if a broker is available.
        
        Args:
            broker_name: Name of the broker to check
            
        Returns:
            True if broker is available, False otherwise
        """
        return broker_name.lower() in cls._brokers
