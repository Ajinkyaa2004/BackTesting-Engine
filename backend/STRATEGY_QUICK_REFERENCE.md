# Strategy Quick Reference Card

**Share this with anyone who wants to write strategies!**

---

## 📝 Template (Copy & Paste)

```python
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict

class YourStrategyName(BaseStrategy):
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Your variables here
        self.price_history = []
        self.position = None
    
    def initialize(self):
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        if not self.initialized:
            self.initialize()
        
        # Your strategy logic here
        
        # Example: Buy when price crosses above MA
        # if condition:
        #     return {
        #         "action": "BUY",
        #         "quantity": 0.001,
        #         "order_type": "MARKET",
        #         "stop_loss_pct": 0.02,
        #         "take_profit_pct": 0.05
        #     }
        
        return None
```

---

## 🎯 Order Actions

| Action | Description | Example |
|--------|-------------|---------|
| `BUY` | Open LONG position | `{"action": "BUY", "quantity": 0.001, ...}` |
| `SELL` | Open SHORT or close LONG | `{"action": "SELL", "position_side": "SHORT", ...}` |
| `CLOSE_ALL` | Close all positions | `{"action": "CLOSE_ALL"}` |
| `CLOSE` | Close specific position | `{"action": "CLOSE", "position_side": "LONG"}` |

---

## 📊 Order Dictionary Fields

```python
{
    "action": "BUY",              # Required: BUY, SELL, CLOSE, CLOSE_ALL
    "quantity": 0.001,             # Required for BUY/SELL
    "order_type": "MARKET",       # Required: MARKET or LIMIT
    "price": None,                # Optional: None = market order
    "stop_loss_pct": 0.02,        # Optional: 2% stop loss
    "take_profit_pct": 0.05,      # Optional: 5% take profit
    "position_side": "SHORT",     # Optional: LONG (default) or SHORT
    "exit_reason": "SIGNAL"       # Optional: For logging
}
```

---

## 🔧 Available Tools

### Position Size Calculator
```python
quantity = self.calculate_position_size(
    entry_price=candle.close,
    stop_loss_price=candle.close * 0.98
)
```

### Candle Data
```python
candle.open      # Open price
candle.high      # High price
candle.low       # Low price
candle.close     # Close price
candle.volume    # Volume
candle.timestamp # Timestamp (ms)
```

### Indicators
```python
from strategies import indicators

# Moving Averages
sma = indicators.calculate_sma(prices, period=20)
ema = indicators.calculate_ema(prices, period=20)

# RSI
rsi = indicators.calculate_rsi(prices, period=14)

# MACD
macd = indicators.calculate_macd(prices, fast=12, slow=26, signal=9)

# Bollinger Bands
bb = indicators.calculate_bollinger_bands(prices, period=20, std_dev=2)
```

---

## ✅ Checklist

- [ ] Inherit from `BaseStrategy`
- [ ] Implement `__init__(self, broker, config=None)`
- [ ] Implement `initialize(self)`
- [ ] Implement `on_candle(self, candle: Candle) -> Optional[Dict]`
- [ ] Return `None` or order dictionary
- [ ] Limit history arrays (prevent memory issues)
- [ ] Check for `None` values from indicators

---

## 🚫 Common Mistakes

❌ **Don't forget:** `super().__init__(broker, config)`  
❌ **Don't forget:** `if not self.initialized: self.initialize()`  
❌ **Don't forget:** Return `None` or `Dict`, not strings  
❌ **Don't forget:** Check for `None` from indicators  
❌ **Don't forget:** Limit array sizes to prevent memory issues  

---

## 📖 Full Documentation

See `STRATEGY_FORMAT_GUIDE.md` for complete documentation with examples.

---

**Ready to code? Copy the template above and start building!** 🚀
