"""
Position management for backtesting engine.
"""
from typing import Optional
from core.candle import Candle


class Position:
    """
    Represents an open trading position.
    """
    
    def __init__(
        self,
        side: str,  # "LONG" or "SHORT"
        entry_price: float,
        quantity: float,
        entry_time: int,  # Timestamp in milliseconds
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        trailing_stop: Optional[float] = None
    ):
        """
        Initialize a position.
        
        Args:
            side: "LONG" or "SHORT"
            entry_price: Entry price
            quantity: Position quantity
            entry_time: Entry timestamp
            stop_loss: Stop loss price (optional)
            take_profit: Take profit price (optional)
            trailing_stop: Trailing stop percentage (optional, e.g., 0.02 for 2%)
        """
        self.side = side.upper()
        self.entry_price = entry_price
        self.quantity = quantity
        self.entry_time = entry_time
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.trailing_stop = trailing_stop
        self.candles_held = 0
        self.highest_price = entry_price if side == "LONG" else entry_price
        self.lowest_price = entry_price if side == "SHORT" else entry_price
    
    def check_stop_loss(self, candle: Candle) -> bool:
        """
        Check if stop loss was hit.
        
        Args:
            candle: Current candle
            
        Returns:
            True if stop loss was hit, False otherwise
        """
        if self.stop_loss is None:
            return False
        
        if self.side == "LONG":
            # Stop loss hit if low price touches or goes below stop loss
            return candle.low <= self.stop_loss
        else:  # SHORT
            # Stop loss hit if high price touches or goes above stop loss
            return candle.high >= self.stop_loss
    
    def check_take_profit(self, candle: Candle) -> bool:
        """
        Check if take profit was hit.
        
        Args:
            candle: Current candle
            
        Returns:
            True if take profit was hit, False otherwise
        """
        if self.take_profit is None:
            return False
        
        if self.side == "LONG":
            # Take profit hit if high price touches or goes above take profit
            return candle.high >= self.take_profit
        else:  # SHORT
            # Take profit hit if low price touches or goes below take profit
            return candle.low <= self.take_profit
    
    def update_trailing_stop(self, candle: Candle) -> Optional[float]:
        """
        Update trailing stop loss based on price movement.
        
        Args:
            candle: Current candle
            
        Returns:
            New stop loss price if updated, None otherwise
        """
        if self.trailing_stop is None:
            return None
        
        if self.side == "LONG":
            # Update highest price
            if candle.high > self.highest_price:
                self.highest_price = candle.high
                new_stop = self.highest_price * (1 - self.trailing_stop)
                if new_stop > (self.stop_loss or 0):
                    self.stop_loss = new_stop
                    return new_stop
        else:  # SHORT
            # Update lowest price
            if candle.low < self.lowest_price:
                self.lowest_price = candle.low
                new_stop = self.lowest_price * (1 + self.trailing_stop)
                if new_stop < (self.stop_loss or float('inf')):
                    self.stop_loss = new_stop
                    return new_stop
        
        return None
    
    def calculate_unrealized_pnl(self, current_price: float) -> float:
        """
        Calculate unrealized profit/loss.
        
        Args:
            current_price: Current market price
            
        Returns:
            Unrealized P&L
        """
        if self.side == "LONG":
            return (current_price - self.entry_price) * self.quantity
        else:  # SHORT
            return (self.entry_price - current_price) * self.quantity
    
    def calculate_realized_pnl(self, exit_price: float) -> float:
        """
        Calculate realized profit/loss.
        
        Args:
            exit_price: Exit price
            
        Returns:
            Realized P&L
        """
        if self.side == "LONG":
            return (exit_price - self.entry_price) * self.quantity
        else:  # SHORT
            return (self.entry_price - exit_price) * self.quantity
    
    def increment_candles_held(self):
        """Increment the number of candles this position has been held."""
        self.candles_held += 1
