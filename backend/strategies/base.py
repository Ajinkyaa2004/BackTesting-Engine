"""
Base strategy class that all strategies must inherit from.
Enhanced to support universal strategy format with config.
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, Union
from core.candle import Candle
from brokers.base import BrokerBase


class BaseStrategy(ABC):
    """
    Universal base class for all trading strategies.
    
    Supports:
    - Configuration via config dict (optional, backward compatible)
    - Multiple order types (BUY, SELL, CLOSE, CLOSE_ALL)
    - SHORT positions
    - Multiple concurrent positions
    - Risk-based position sizing
    
    All user-uploaded strategies must inherit from this class
    and implement the required methods.
    """
    
    def __init__(self, broker: BrokerBase, config: Optional[Dict[str, Any]] = None):
        """
        Initialize strategy with broker and optional configuration.
        
        Args:
            broker: Broker instance for fetching data and placing orders
            config: Optional configuration dictionary with strategy parameters
                   If None, strategy works in backward-compatible mode
        """
        self.broker = broker
        self.config = config or {}
        self.initialized = False
        
        # Extract common config values
        self.max_positions = self.config.get("max_positions", 1)
        self.risk_per_trade = self.config.get("risk_per_trade", 0.02)  # 2% default
        self.initial_capital = self.config.get("initial_capital", 10000.0)
    
    @abstractmethod
    def initialize(self):
        """
        Initialize strategy - called once before processing candles.
        
        Use this to:
        - Set up indicators
        - Initialize variables
        - Configure strategy parameters
        - Load ML models if needed
        """
        pass
    
    @abstractmethod
    def on_candle(self, candle: Candle) -> Optional[Union[Dict[str, Any], List[Dict[str, Any]]]]:
        """
        Called for each new candle.
        
        Args:
            candle: Current candle data with OHLCV
            
        Returns:
            None: No action
            Dict: Single order
            List[Dict]: Multiple orders (for portfolio strategies)
            
        Order Format:
            {
                "action": "BUY" | "SELL" | "CLOSE" | "CLOSE_ALL",
                "quantity": float,  # Required for BUY/SELL
                "price": float | None,  # None = market order
                "order_type": "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT",
                "stop_loss": float (optional),
                "stop_loss_pct": float (optional),  # Alternative to stop_loss
                "take_profit": float (optional),
                "take_profit_pct": float (optional),  # Alternative to take_profit
                "trailing_stop": float (optional),  # Percentage
                "exit_reason": str (optional),
                "position_side": "LONG" | "SHORT" (optional, defaults to LONG for BUY)
            }
        """
        pass
    
    def calculate_position_size(
        self, 
        entry_price: float, 
        stop_loss_price: float,
        risk_amount: Optional[float] = None
    ) -> float:
        """
        Calculate position size based on risk management.
        
        Args:
            entry_price: Entry price
            stop_loss_price: Stop loss price
            risk_amount: Risk amount (uses config if None)
            
        Returns:
            Position size (quantity)
        """
        if risk_amount is None:
            risk_amount = self.initial_capital * self.risk_per_trade
        
        risk_per_unit = abs(entry_price - stop_loss_price)
        if risk_per_unit == 0:
            return 0.0
        
        return risk_amount / risk_per_unit
    
    def get_name(self) -> str:
        """
        Get strategy name (defaults to class name).
        
        Returns:
            Strategy name
        """
        return self.__class__.__name__
