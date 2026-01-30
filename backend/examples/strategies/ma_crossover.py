"""
Example Strategy 1: Simple Moving Average Crossover Strategy
This strategy demonstrates basic LONG-only trading with CLOSE_ALL.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class MACrossoverStrategy(BaseStrategy):
    """
    Simple Moving Average Crossover Strategy.
    
    Entry: Fast MA crosses above Slow MA
    Exit: Fast MA crosses below Slow MA OR stop loss/take profit
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.fast_period = 10
        self.slow_period = 20
        self.price_history = []
        self.position = None
    
    def initialize(self):
        """Initialize strategy."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """Main strategy logic."""
        if not self.initialized:
            self.initialize()
        
        # Update price history
        self.price_history.append(candle.close)
        
        # Keep only last 100 prices
        if len(self.price_history) > 100:
            self.price_history.pop(0)
        
        # Calculate MAs if we have enough data
        if len(self.price_history) >= self.slow_period:
            # Calculate SMAs
            fast_ma = sum(self.price_history[-self.fast_period:]) / self.fast_period
            slow_ma = sum(self.price_history[-self.slow_period:]) / self.slow_period
            
            # Entry logic: Fast MA crosses above Slow MA
            if self.position is None and fast_ma > slow_ma:
                self.position = "LONG"
                # Calculate position size based on risk
                stop_loss_price = candle.close * 0.98  # 2% stop loss
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "BUY",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "stop_loss_pct": 0.02,  # 2% stop loss
                    "take_profit_pct": 0.05,  # 5% take profit
                    "exit_reason": "MA_CROSSOVER_ENTRY"
                }
            
            # Exit logic: Fast MA crosses below Slow MA
            if self.position == "LONG" and fast_ma < slow_ma:
                self.position = None
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "MA_CROSSOVER_EXIT"
                }
        
        return None
