# Strategy Validation Checklist

Use this checklist to validate strategy code before uploading.

---

## ✅ Pre-Upload Validation

### 1. Code Structure
- [ ] Code inherits from `BaseStrategy`
- [ ] Has `__init__(self, broker, config=None)` method
- [ ] Has `initialize(self)` method
- [ ] Has `on_candle(self, candle: Candle) -> Optional[Dict]` method
- [ ] All required imports are present

### 2. Syntax Check
- [ ] Python syntax is valid (no syntax errors)
- [ ] All brackets/quotes are properly closed
- [ ] Indentation is correct (4 spaces or tabs)
- [ ] No undefined variables (except those defined in `__init__`)

### 3. Return Values
- [ ] `on_candle()` returns `None` or `Dict`
- [ ] Order dictionaries have required fields:
  - [ ] `action` (BUY, SELL, CLOSE, or CLOSE_ALL)
  - [ ] `quantity` (if action is BUY or SELL)
  - [ ] `order_type` (MARKET or LIMIT)

### 4. Best Practices
- [ ] History arrays are limited in size
- [ ] None checks for indicator values
- [ ] Position state is tracked
- [ ] Initialize check is present

---

## 🔍 Validation Rules

### Rule 1: Class Name Must Match
```python
# If uploading with class_name="MyStrategy"
class MyStrategy(BaseStrategy):  # ✅ Correct
    pass

class DifferentName(BaseStrategy):  # ❌ Wrong
    pass
```

### Rule 2: Required Methods
```python
class Strategy(BaseStrategy):
    def __init__(self, broker, config=None):  # ✅ Required
        pass
    
    def initialize(self):  # ✅ Required
        pass
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:  # ✅ Required
        pass
```

### Rule 3: Return Types
```python
def on_candle(self, candle: Candle) -> Optional[Dict]:
    return None  # ✅ Valid
    return {"action": "BUY", ...}  # ✅ Valid
    return "BUY"  # ❌ Invalid
    return []  # ❌ Invalid
```

### Rule 4: Order Dictionary
```python
# ✅ Valid
{
    "action": "BUY",
    "quantity": 0.001,
    "order_type": "MARKET"
}

# ❌ Invalid - missing required fields
{
    "action": "BUY"
    # Missing quantity and order_type
}
```

---

## 🧪 Test Before Upload

### Quick Test Script

```python
# Test your strategy locally before uploading
from strategies.base import BaseStrategy
from core.candle import Candle

# Your strategy code here...

# Test initialization
try:
    strategy = YourStrategy(broker=None, config=None)
    strategy.initialize()
    print("✅ Initialization: PASSED")
except Exception as e:
    print(f"❌ Initialization: FAILED - {e}")

# Test on_candle with dummy candle
try:
    dummy_candle = Candle(
        timestamp=1000,
        open=100.0,
        high=105.0,
        low=95.0,
        close=102.0,
        volume=1000.0
    )
    result = strategy.on_candle(dummy_candle)
    if result is None or isinstance(result, dict):
        print("✅ on_candle return type: PASSED")
    else:
        print(f"❌ on_candle return type: FAILED - {type(result)}")
except Exception as e:
    print(f"❌ on_candle execution: FAILED - {e}")
```

---

## 📋 Upload Format

When uploading via API, the code must be a **string** with `\n` for newlines:

```json
{
  "name": "My Strategy",
  "class_name": "MyStrategy",
  "code": "from strategies.base import BaseStrategy\nfrom core.candle import Candle\n..."
}
```

**Important:** Replace actual newlines with `\n` in JSON!

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Class must inherit from BaseStrategy" | Not inheriting from BaseStrategy | Add `BaseStrategy` as parent class |
| "Class 'X' not found" | Class name mismatch | Ensure class name matches `class_name` in upload |
| "Error executing strategy code" | Syntax error | Check Python syntax |
| "name 'indicators' is not defined" | Missing import | Add `from strategies import indicators` |
| No trades executed | Logic never returns order | Check strategy conditions |

---

## ✅ Final Checklist

Before uploading, ensure:

1. ✅ Code is valid Python
2. ✅ Inherits from `BaseStrategy`
3. ✅ Has all required methods
4. ✅ Returns correct types
5. ✅ Order dictionaries are valid
6. ✅ Class name matches upload `class_name`
7. ✅ Code is properly escaped for JSON (if uploading via API)

---

**Follow this checklist and your strategy will upload successfully!** ✅
