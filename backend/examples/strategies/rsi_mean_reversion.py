"""
Example Strategy 2: RSI Mean Reversion Strategy
This strategy demonstrates LONG and SHORT trading.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class RSIMeanReversionStrategy(BaseStrategy):
    """
    RSI Mean Reversion Strategy - Trades both LONG and SHORT.
    
    Entry LONG: RSI < 30 (oversold)
    Entry SHORT: RSI > 70 (overbought)
    Exit: RSI returns to neutral (40-60)
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.rsi_period = 14
        self.rsi_oversold = 30
        self.rsi_overbought = 70
        self.price_history = []
    
    def initialize(self):
        """Initialize strategy."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """Main strategy logic."""
        if not self.initialized:
            self.initialize()
        
        # Update price history
        self.price_history.append(candle.close)
        
        # Keep only last 200 prices
        if len(self.price_history) > 200:
            self.price_history.pop(0)
        
        if len(self.price_history) >= self.rsi_period + 1:
            # Calculate RSI
            rsi_values = indicators.calculate_rsi(self.price_history, self.rsi_period)
            current_rsi = rsi_values[-1]
            
            if current_rsi is None:
                return None
            
            # LONG entry: RSI oversold
            if current_rsi < self.rsi_oversold:
                stop_loss_price = candle.close * 0.97  # 3% stop loss
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "BUY",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "stop_loss_pct": 0.03,  # 3% stop loss
                    "take_profit_pct": 0.06,  # 6% take profit
                    "exit_reason": "RSI_OVERSOLD_ENTRY"
                }
            
            # SHORT entry: RSI overbought
            elif current_rsi > self.rsi_overbought:
                stop_loss_price = candle.close * 1.03  # 3% stop loss for SHORT
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "SELL",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "position_side": "SHORT",
                    "stop_loss_pct": 0.03,  # 3% stop loss
                    "take_profit_pct": 0.06,  # 6% take profit
                    "exit_reason": "RSI_OVERBOUGHT_ENTRY"
                }
            
            # Exit: RSI returns to neutral
            elif 40 <= current_rsi <= 60:
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "RSI_NEUTRAL_EXIT"
                }
        
        return None
