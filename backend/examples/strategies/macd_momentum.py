"""
Example Strategy 3: MACD Momentum Strategy
This strategy demonstrates using MACD indicator with trailing stops.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class MACDMomentumStrategy(BaseStrategy):
    """
    MACD Momentum Strategy.
    
    Entry: MACD line crosses above signal line (bullish)
    Exit: MACD line crosses below signal line OR trailing stop
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.fast_period = 12
        self.slow_period = 26
        self.signal_period = 9
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
        
        # Keep only last 200 prices
        if len(self.price_history) > 200:
            self.price_history.pop(0)
        
        if len(self.price_history) >= self.slow_period:
            # Calculate MACD
            macd_data = indicators.calculate_macd(
                self.price_history,
                fast=self.fast_period,
                slow=self.slow_period,
                signal=self.signal_period
            )
            
            macd_line = macd_data['macd']
            signal_line = macd_data['signal']
            
            if len(macd_line) < 2 or macd_line[-1] is None or signal_line[-1] is None:
                return None
            
            current_macd = macd_line[-1]
            current_signal = signal_line[-1]
            prev_macd = macd_line[-2] if len(macd_line) >= 2 else None
            prev_signal = signal_line[-2] if len(signal_line) >= 2 else None
            
            if prev_macd is None or prev_signal is None:
                return None
            
            # Entry: MACD crosses above signal (bullish crossover)
            if self.position is None:
                if prev_macd <= prev_signal and current_macd > current_signal:
                    self.position = "LONG"
                    stop_loss_price = candle.close * 0.95  # 5% stop loss
                    quantity = self.calculate_position_size(
                        entry_price=candle.close,
                        stop_loss_price=stop_loss_price
                    )
                    
                    return {
                        "action": "BUY",
                        "quantity": quantity,
                        "order_type": "MARKET",
                        "stop_loss_pct": 0.05,
                        "take_profit_pct": 0.10,
                        "trailing_stop": 0.03,  # 3% trailing stop
                        "exit_reason": "MACD_BULLISH_CROSSOVER"
                    }
            
            # Exit: MACD crosses below signal (bearish crossover)
            elif self.position == "LONG":
                if prev_macd >= prev_signal and current_macd < current_signal:
                    self.position = None
                    return {
                        "action": "CLOSE_ALL",
                        "exit_reason": "MACD_BEARISH_CROSSOVER"
                    }
        
        return None
