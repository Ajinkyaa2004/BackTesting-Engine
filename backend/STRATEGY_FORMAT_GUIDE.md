# Strategy Format Guide - How to Write Trading Strategies

This guide explains the exact format required to write trading strategies that work with our backtesting system.

---

## 📋 Table of Contents

1. [Basic Structure](#basic-structure)
2. [Required Components](#required-components)
3. [Order Format](#order-format)
4. [Complete Examples](#complete-examples)
5. [Available Tools](#available-tools)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)

---

## Basic Structure

Every strategy **MUST** follow this structure:

```python
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
# Optional: from strategies import indicators

class YourStrategyName(BaseStrategy):
    """
    Your strategy description here.
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Initialize your variables here
        self.your_variable = None
    
    def initialize(self):
        """Called once before processing candles."""
        self.initialized = True
        # Setup code here
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """
        Called for each new candle.
        Return None or an order dictionary.
        """
        if not self.initialized:
            self.initialize()
        
        # Your strategy logic here
        
        return None  # or return order dictionary
```

---

## Required Components

### 1. Imports (Required)

```python
from strategies.base import BaseStrategy  # REQUIRED
from core.candle import Candle            # REQUIRED
from typing import Optional, Dict        # REQUIRED
```

**Optional but recommended:**
```python
from strategies import indicators  # For technical indicators
```

### 2. Class Definition (Required)

```python
class YourStrategyName(BaseStrategy):
    # MUST inherit from BaseStrategy
    # Class name can be anything, but should match class_name in upload
```

### 3. `__init__` Method (Required)

```python
def __init__(self, broker, config=None):
    super().__init__(broker, config)
    # Initialize your variables
    # config is optional but recommended for parameters
```

### 4. `initialize` Method (Required)

```python
def initialize(self):
    """Called once before processing starts."""
    self.initialized = True
    # Setup indicators, variables, etc.
```

### 5. `on_candle` Method (Required)

```python
def on_candle(self, candle: Candle) -> Optional[Dict]:
    """
    Called for each new candle.
    
    Args:
        candle: Candle object with:
            - candle.timestamp (int): Timestamp in milliseconds
            - candle.open (float): Open price
            - candle.high (float): High price
            - candle.low (float): Low price
            - candle.close (float): Close price
            - candle.volume (float): Volume
    
    Returns:
        None: No action
        Dict: Order dictionary (see Order Format below)
    """
    if not self.initialized:
        self.initialize()
    
    # Your logic here
    
    return None  # or return order dict
```

---

## Order Format

When your strategy wants to place an order, return a dictionary with these fields:

### Basic Order Structure

```python
{
    "action": str,           # REQUIRED: "BUY", "SELL", "CLOSE", "CLOSE_ALL"
    "quantity": float,       # REQUIRED for BUY/SELL
    "order_type": str,       # REQUIRED: "MARKET" or "LIMIT"
    "price": float | None,   # Optional: None = market order
    "stop_loss": float,      # Optional: Absolute stop loss price
    "stop_loss_pct": float,  # Optional: Stop loss percentage (0.02 = 2%)
    "take_profit": float,    # Optional: Absolute take profit price
    "take_profit_pct": float,# Optional: Take profit percentage (0.05 = 5%)
    "trailing_stop": float,  # Optional: Trailing stop percentage
    "position_side": str,    # Optional: "LONG" or "SHORT" (default: LONG for BUY)
    "exit_reason": str       # Optional: Reason for order (for logging)
}
```

### Order Actions

#### 1. BUY (Open LONG Position)
```python
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "MARKET",
    "stop_loss_pct": 0.02,      # 2% stop loss
    "take_profit_pct": 0.05     # 5% take profit
}
```

#### 2. SELL (Open SHORT Position or Close LONG)
```python
# To open SHORT position:
{
    "action": "SELL",
    "quantity": 0.001,
    "order_type": "MARKET",
    "position_side": "SHORT",   # Specify SHORT
    "stop_loss_pct": 0.02,
    "take_profit_pct": 0.05
}

# To close LONG position (if you have one):
{
    "action": "SELL",
    "quantity": 0.001,  # Can be any value, closes entire position
    "order_type": "MARKET"
}
```

#### 3. CLOSE_ALL (Close All Positions)
```python
{
    "action": "CLOSE_ALL",
    "exit_reason": "STRATEGY_EXIT_SIGNAL"
}
```

#### 4. CLOSE (Close Specific Position)
```python
{
    "action": "CLOSE",
    "position_side": "LONG",  # or "SHORT"
    "exit_reason": "MANUAL_EXIT"
}
```

### Order Types

- **MARKET**: Immediate execution at current market price
- **LIMIT**: Execute only if price reaches limit price

```python
# Market order
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "MARKET",
    "price": None  # or omit price
}

# Limit order
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "LIMIT",
    "price": 50000.0  # Will only fill if price reaches this
}
```

### Stop Loss & Take Profit

You can use **absolute prices** or **percentages**:

```python
# Using percentages (recommended)
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "MARKET",
    "stop_loss_pct": 0.02,      # 2% stop loss
    "take_profit_pct": 0.05      # 5% take profit
}

# Using absolute prices
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "MARKET",
    "stop_loss": 49000.0,        # Absolute stop loss price
    "take_profit": 52500.0       # Absolute take profit price
}
```

---

## Complete Examples

### Example 1: Simple Moving Average Crossover

```python
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict

class MACrossoverStrategy(BaseStrategy):
    """
    Simple Moving Average Crossover Strategy.
    
    Entry: Fast MA crosses above Slow MA
    Exit: Fast MA crosses below Slow MA
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
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
        
        # Keep only last 100 prices (memory management)
        if len(self.price_history) > 100:
            self.price_history.pop(0)
        
        # Need at least slow_period candles
        if len(self.price_history) >= self.slow_period:
            # Calculate moving averages
            fast_ma = sum(self.price_history[-self.fast_period:]) / self.fast_period
            slow_ma = sum(self.price_history[-self.slow_period:]) / self.slow_period
            
            # Entry: Fast MA crosses above Slow MA
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
                    "stop_loss_pct": 0.02,      # 2% stop loss
                    "take_profit_pct": 0.05,    # 5% take profit
                    "exit_reason": "MA_CROSSOVER_ENTRY"
                }
            
            # Exit: Fast MA crosses below Slow MA
            if self.position == "LONG" and fast_ma < slow_ma:
                self.position = None
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "MA_CROSSOVER_EXIT"
                }
        
        return None
```

### Example 2: RSI Mean Reversion (LONG + SHORT)

```python
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators

class RSIMeanReversionStrategy(BaseStrategy):
    """
    RSI Mean Reversion Strategy.
    
    Entry LONG: RSI < 30 (oversold)
    Entry SHORT: RSI > 70 (overbought)
    Exit: RSI returns to neutral (40-60)
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
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
        
        # Need at least rsi_period + 1 candles
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
                    "stop_loss_pct": 0.03,
                    "take_profit_pct": 0.06,
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
                    "position_side": "SHORT",  # Important: specify SHORT
                    "stop_loss_pct": 0.03,
                    "take_profit_pct": 0.06,
                    "exit_reason": "RSI_OVERBOUGHT_ENTRY"
                }
            
            # Exit: RSI returns to neutral
            elif 40 <= current_rsi <= 60:
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "RSI_NEUTRAL_EXIT"
                }
        
        return None
```

### Example 3: MACD with Trailing Stop

```python
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators

class MACDStrategy(BaseStrategy):
    """
    MACD Momentum Strategy with Trailing Stop.
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
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
        
        self.price_history.append(candle.close)
        
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
            
            if len(macd_line) < 2:
                return None
            
            current_macd = macd_line[-1]
            current_signal = signal_line[-1]
            prev_macd = macd_line[-2]
            prev_signal = signal_line[-2]
            
            if current_macd is None or current_signal is None:
                return None
            
            # Entry: MACD crosses above signal
            if self.position is None:
                if prev_macd <= prev_signal and current_macd > current_signal:
                    self.position = "LONG"
                    stop_loss_price = candle.close * 0.95
                    quantity = self.calculate_position_size(
                        candle.close,
                        stop_loss_price
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
            
            # Exit: MACD crosses below signal
            elif self.position == "LONG":
                if prev_macd >= prev_signal and current_macd < current_signal:
                    self.position = None
                    return {
                        "action": "CLOSE_ALL",
                        "exit_reason": "MACD_BEARISH_CROSSOVER"
                    }
        
        return None
```

---

## Available Tools

### 1. Position Size Calculator

Use `self.calculate_position_size()` to calculate position size based on risk:

```python
quantity = self.calculate_position_size(
    entry_price=candle.close,
    stop_loss_price=candle.close * 0.98,  # 2% stop loss
    risk_amount=None  # Uses config.risk_per_trade if None
)
```

### 2. Technical Indicators

Import and use indicators:

```python
from strategies import indicators

# Simple Moving Average
sma_values = indicators.calculate_sma(prices, period=20)

# Exponential Moving Average
ema_values = indicators.calculate_ema(prices, period=20)

# RSI
rsi_values = indicators.calculate_rsi(prices, period=14)

# MACD
macd_data = indicators.calculate_macd(
    prices,
    fast=12,
    slow=26,
    signal=9
)
# Returns: {'macd': [...], 'signal': [...], 'histogram': [...]}

# Bollinger Bands
bb_data = indicators.calculate_bollinger_bands(
    prices,
    period=20,
    std_dev=2
)
# Returns: {'upper': [...], 'middle': [...], 'lower': [...]}

# ATR (Average True Range)
atr_values = indicators.calculate_atr(
    highs=[...],
    lows=[...],
    closes=[...],
    period=14
)

# Supertrend
supertrend_values = indicators.calculate_supertrend(
    highs=[...],
    lows=[...],
    closes=[...],
    period=7,
    multiplier=3.0
)
```

### 3. Candle Data

Each candle provides:

```python
candle.timestamp  # int: Timestamp in milliseconds
candle.open       # float: Open price
candle.high       # float: High price
candle.low        # float: Low price
candle.close      # float: Close price
candle.volume     # float: Volume
```

### 4. Configuration Access

Access config values:

```python
# In __init__ or on_candle
self.max_positions    # Max concurrent positions
self.risk_per_trade   # Risk per trade (0.02 = 2%)
self.initial_capital  # Starting capital
self.config           # Full config dictionary
```

---

## Best Practices

### 1. Memory Management

Limit history arrays to prevent memory issues:

```python
# Good: Limit history size
if len(self.price_history) > 100:
    self.price_history.pop(0)

# Bad: Unlimited growth
self.price_history.append(candle.close)  # Will grow forever!
```

### 2. Position Tracking

Track your position state:

```python
# Good: Track position state
self.position = None  # or "LONG" or "SHORT"

if self.position is None:
    # Entry logic
elif self.position == "LONG":
    # Exit logic
```

### 3. Error Handling

Check for None values from indicators:

```python
# Good: Check for None
rsi = indicators.calculate_rsi(prices, 14)[-1]
if rsi is None:
    return None

# Bad: Will crash if None
rsi = indicators.calculate_rsi(prices, 14)[-1]
if rsi < 30:  # Crashes if rsi is None!
```

### 4. Initialize Check

Always check initialization:

```python
def on_candle(self, candle: Candle) -> Optional[Dict]:
    if not self.initialized:
        self.initialize()
    # Rest of code
```

### 5. Return Types

Always return proper types:

```python
# Good: Returns None or Dict
return None
return {"action": "BUY", ...}

# Bad: Returns other types
return "BUY"  # Wrong!
return []     # Wrong!
```

---

## Common Patterns

### Pattern 1: Crossover Detection

```python
# Store previous values
self.prev_fast_ma = None
self.prev_slow_ma = None

# Calculate current values
fast_ma = calculate_fast_ma()
slow_ma = calculate_slow_ma()

# Detect crossover
if self.prev_fast_ma is not None:
    if self.prev_fast_ma <= self.prev_slow_ma and fast_ma > slow_ma:
        # Bullish crossover
        return {"action": "BUY", ...}
    elif self.prev_fast_ma >= self.prev_slow_ma and fast_ma < slow_ma:
        # Bearish crossover
        return {"action": "CLOSE_ALL", ...}

# Update previous values
self.prev_fast_ma = fast_ma
self.prev_slow_ma = slow_ma
```

### Pattern 2: Threshold-Based Entry

```python
rsi = calculate_rsi()

if rsi < 30:  # Oversold
    return {"action": "BUY", ...}
elif rsi > 70:  # Overbought
    return {"action": "SELL", "position_side": "SHORT", ...}
```

### Pattern 3: Multiple Conditions

```python
# Check multiple conditions
ma_condition = fast_ma > slow_ma
volume_condition = candle.volume > average_volume
rsi_condition = rsi < 50

if ma_condition and volume_condition and rsi_condition:
    return {"action": "BUY", ...}
```

### Pattern 4: Time-Based Exit

```python
# Track entry time
if self.position is None:
    self.entry_time = candle.timestamp
    return {"action": "BUY", ...}

# Exit after N candles
candles_held = (candle.timestamp - self.entry_time) / (interval_ms)
if candles_held > 10:  # Exit after 10 candles
    return {"action": "CLOSE_ALL", ...}
```

---

## Quick Reference

### Required Structure
```python
class Strategy(BaseStrategy):
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
    
    def initialize(self):
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        if not self.initialized:
            self.initialize()
        return None  # or order dict
```

### Order Dictionary
```python
{
    "action": "BUY" | "SELL" | "CLOSE" | "CLOSE_ALL",
    "quantity": float,
    "order_type": "MARKET" | "LIMIT",
    "stop_loss_pct": float,  # 0.02 = 2%
    "take_profit_pct": float,  # 0.05 = 5%
    "position_side": "SHORT"  # Optional, for SHORT positions
}
```

### Available Indicators
- `indicators.calculate_sma(prices, period)`
- `indicators.calculate_ema(prices, period)`
- `indicators.calculate_rsi(prices, period)`
- `indicators.calculate_macd(prices, fast, slow, signal)`
- `indicators.calculate_bollinger_bands(prices, period, std_dev)`
- `indicators.calculate_atr(highs, lows, closes, period)`
- `indicators.calculate_supertrend(highs, lows, closes, period, multiplier)`

---

## Summary

✅ **Required:**
- Inherit from `BaseStrategy`
- Implement `__init__`, `initialize()`, and `on_candle()`
- Return `None` or order dictionary

✅ **Order Format:**
- `action`: "BUY", "SELL", "CLOSE", "CLOSE_ALL"
- `quantity`: Required for BUY/SELL
- `order_type`: "MARKET" or "LIMIT"
- `stop_loss_pct` / `take_profit_pct`: Percentage-based stops
- `position_side`: "SHORT" for short positions

✅ **Best Practices:**
- Limit history arrays
- Check for None values
- Track position state
- Use `calculate_position_size()` for risk management

**That's it! Follow this format and your strategy will work!** 🚀
