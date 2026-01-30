# Postman Testing Guide - Universal Strategy System

Complete guide for testing the universal strategy backtesting system with Postman.

---

## Setup

### 1. Start the Backend Server

```powershell
cd backend
.\run.ps1
```

Server will run on: `http://localhost:8000`

### 2. Create Postman Environment (Optional but Recommended)

Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:8000`
- `access_token`: (will be set automatically after login)

---

## Step-by-Step Testing

### Step 1: Register a User

**Request:**
```
POST {{base_url}}/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "trader@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "email": "trader@example.com",
  "is_active": true,
  "created_at": "2026-01-29T00:00:00",
  "updated_at": "2026-01-29T00:00:00"
}
```

---

### Step 2: Login and Get JWT Token

**Request:**
```
POST {{base_url}}/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "trader@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Postman Script (Tests tab) - Auto-save token:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
}
```

---

### Step 3: Verify Broker Data is Available

**Request:**
```
GET {{base_url}}/brokers/available
```

**Expected Response (200):**
```json
{
  "brokers": ["binance"],
  "count": 1
}
```

**Test OHLC Data:**
```
GET {{base_url}}/brokers/ohlc?broker=binance&symbol=BTCUSDT&interval=1h&limit=10
```

---

### Step 4: Upload Strategy 1 - MA Crossover (LONG Only)

**Request:**
```
POST {{base_url}}/strategies/upload
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "name": "MA Crossover Strategy",
  "description": "Simple moving average crossover with LONG positions only",
  "class_name": "MACrossoverStrategy",
  "code": "from strategies.base import BaseStrategy\nfrom core.candle import Candle\nfrom typing import Optional, Dict\nfrom strategies import indicators\n\nclass MACrossoverStrategy(BaseStrategy):\n    def __init__(self, broker, config=None):\n        super().__init__(broker, config)\n        self.fast_period = 10\n        self.slow_period = 20\n        self.price_history = []\n        self.position = None\n    \n    def initialize(self):\n        self.initialized = True\n    \n    def on_candle(self, candle: Candle) -> Optional[Dict]:\n        if not self.initialized:\n            self.initialize()\n        \n        self.price_history.append(candle.close)\n        if len(self.price_history) > 100:\n            self.price_history.pop(0)\n        \n        if len(self.price_history) >= self.slow_period:\n            fast_ma = sum(self.price_history[-self.fast_period:]) / self.fast_period\n            slow_ma = sum(self.price_history[-self.slow_period:]) / self.slow_period\n            \n            if self.position is None and fast_ma > slow_ma:\n                self.position = \"LONG\"\n                stop_loss_price = candle.close * 0.98\n                quantity = self.calculate_position_size(candle.close, stop_loss_price)\n                return {\"action\": \"BUY\", \"quantity\": quantity, \"order_type\": \"MARKET\", \"stop_loss_pct\": 0.02, \"take_profit_pct\": 0.05, \"exit_reason\": \"MA_CROSSOVER_ENTRY\"}\n            \n            if self.position == \"LONG\" and fast_ma < slow_ma:\n                self.position = None\n                return {\"action\": \"CLOSE_ALL\", \"exit_reason\": \"MA_CROSSOVER_EXIT\"}\n        \n        return None"
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "name": "MA Crossover Strategy",
  "description": "Simple moving average crossover with LONG positions only",
  "class_name": "MACrossoverStrategy",
  "is_active": true,
  "user_id": 1,
  "created_at": "2026-01-29T00:00:00",
  "updated_at": "2026-01-29T00:00:00"
}
```

**Save the `id` (e.g., 1) for backtesting!**

---

### Step 5: Upload Strategy 2 - RSI Mean Reversion (LONG + SHORT)

**Request:**
```
POST {{base_url}}/strategies/upload
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "name": "RSI Mean Reversion Strategy",
  "description": "RSI-based mean reversion trading LONG and SHORT",
  "class_name": "RSIMeanReversionStrategy",
  "code": "from strategies.base import BaseStrategy\nfrom core.candle import Candle\nfrom typing import Optional, Dict\nfrom strategies import indicators\n\nclass RSIMeanReversionStrategy(BaseStrategy):\n    def __init__(self, broker, config=None):\n        super().__init__(broker, config)\n        self.rsi_period = 14\n        self.rsi_oversold = 30\n        self.rsi_overbought = 70\n        self.price_history = []\n    \n    def initialize(self):\n        self.initialized = True\n    \n    def on_candle(self, candle: Candle) -> Optional[Dict]:\n        if not self.initialized:\n            self.initialize()\n        \n        self.price_history.append(candle.close)\n        if len(self.price_history) > 200:\n            self.price_history.pop(0)\n        \n        if len(self.price_history) >= self.rsi_period + 1:\n            rsi_values = indicators.calculate_rsi(self.price_history, self.rsi_period)\n            current_rsi = rsi_values[-1]\n            \n            if current_rsi is None:\n                return None\n            \n            if current_rsi < self.rsi_oversold:\n                stop_loss_price = candle.close * 0.97\n                quantity = self.calculate_position_size(candle.close, stop_loss_price)\n                return {\"action\": \"BUY\", \"quantity\": quantity, \"order_type\": \"MARKET\", \"stop_loss_pct\": 0.03, \"take_profit_pct\": 0.06, \"exit_reason\": \"RSI_OVERSOLD_ENTRY\"}\n            \n            elif current_rsi > self.rsi_overbought:\n                stop_loss_price = candle.close * 1.03\n                quantity = self.calculate_position_size(candle.close, stop_loss_price)\n                return {\"action\": \"SELL\", \"quantity\": quantity, \"order_type\": \"MARKET\", \"position_side\": \"SHORT\", \"stop_loss_pct\": 0.03, \"take_profit_pct\": 0.06, \"exit_reason\": \"RSI_OVERBOUGHT_ENTRY\"}\n            \n            elif 40 <= current_rsi <= 60:\n                return {\"action\": \"CLOSE_ALL\", \"exit_reason\": \"RSI_NEUTRAL_EXIT\"}\n        \n        return None"
}
```

**Expected Response (201):**
```json
{
  "id": 2,
  "name": "RSI Mean Reversion Strategy",
  "description": "RSI-based mean reversion trading LONG and SHORT",
  "class_name": "RSIMeanReversionStrategy",
  "is_active": true,
  "user_id": 1,
  "created_at": "2026-01-29T00:00:00",
  "updated_at": "2026-01-29T00:00:00"
}
```

---

### Step 6: List All Strategies

**Request:**
```
GET {{base_url}}/strategies
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "name": "MA Crossover Strategy",
    "description": "Simple moving average crossover with LONG positions only",
    "class_name": "MACrossoverStrategy",
    "is_active": true,
    "user_id": 1,
    "created_at": "2026-01-29T00:00:00",
    "updated_at": "2026-01-29T00:00:00"
  },
  {
    "id": 2,
    "name": "RSI Mean Reversion Strategy",
    "description": "RSI-based mean reversion trading LONG and SHORT",
    "class_name": "RSIMeanReversionStrategy",
    "is_active": true,
    "user_id": 1,
    "created_at": "2026-01-29T00:00:00",
    "updated_at": "2026-01-29T00:00:00"
  }
]
```

---

### Step 7: Run Backtest - MA Crossover Strategy

**Request:**
```
POST {{base_url}}/strategies/backtest/run
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

**Body (JSON) - Basic:**
```json
{
  "strategy_id": 1,
  "broker": "binance",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500,
  "initial_capital": 10000,
  "max_positions": 1,
  "risk_per_trade": 0.02
}
```

**Body (JSON) - With Time Range:**
```json
{
  "strategy_id": 1,
  "broker": "binance",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "start_time": 1704067200000,
  "end_time": 1704153600000,
  "initial_capital": 10000,
  "max_positions": 1,
  "risk_per_trade": 0.02
}
```

**Expected Response (200):**
```json
{
  "backtest_id": 1,
  "strategy_name": "MA Crossover Strategy",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "initial_capital": 10000.0,
  "final_capital": 10500.50,
  "metrics": {
    "total_return": 0.05,
    "sharpe_ratio": 1.2,
    "max_drawdown": -0.03,
    "win_rate": 0.55,
    "avg_win": 150.25,
    "avg_loss": -75.50,
    "profit_factor": 2.0
  },
  "total_trades": 20,
  "winning_trades": 11,
  "losing_trades": 9,
  "trades": [
    {
      "entry_time": 1704067200000,
      "exit_time": 1704070800000,
      "side": "LONG",
      "entry_price": 43250.50,
      "exit_price": 43800.75,
      "quantity": 0.001,
      "pnl": 0.55,
      "return_pct": 1.27,
      "exit_reason": "TAKE_PROFIT",
      "candles_held": 1
    }
  ],
  "equity_curve": [10000, 10050, 10100, ...],
  "created_at": "2026-01-29T00:00:00"
}
```

---

### Step 8: Run Backtest - RSI Strategy (LONG + SHORT)

**Request:**
```
POST {{base_url}}/strategies/backtest/run
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{access_token}}
```

**Body (JSON):**
```json
{
  "strategy_id": 2,
  "broker": "binance",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500,
  "initial_capital": 10000,
  "max_positions": 1,
  "risk_per_trade": 0.02
}
```

**Expected Response (200):**
```json
{
  "backtest_id": 2,
  "strategy_name": "RSI Mean Reversion Strategy",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "initial_capital": 10000.0,
  "final_capital": 10200.30,
  "metrics": {
    "total_return": 0.02,
    "sharpe_ratio": 0.8,
    "max_drawdown": -0.05,
    "win_rate": 0.60,
    "avg_win": 120.50,
    "avg_loss": -80.25,
    "profit_factor": 1.5
  },
  "total_trades": 25,
  "winning_trades": 15,
  "losing_trades": 10,
  "trades": [
    {
      "entry_time": 1704067200000,
      "exit_time": 1704070800000,
      "side": "LONG",
      "entry_price": 43250.50,
      "exit_price": 43800.75,
      "quantity": 0.001,
      "pnl": 0.55,
      "return_pct": 1.27,
      "exit_reason": "RSI_NEUTRAL_EXIT",
      "candles_held": 3
    },
    {
      "entry_time": 1704074400000,
      "exit_time": 1704081600000,
      "side": "SHORT",
      "entry_price": 44000.00,
      "exit_price": 43500.00,
      "quantity": 0.001,
      "pnl": 0.50,
      "return_pct": 1.14,
      "exit_reason": "RSI_NEUTRAL_EXIT",
      "candles_held": 2
    }
  ],
  "equity_curve": [10000, 10020, 10040, ...],
  "created_at": "2026-01-29T00:00:00"
}
```

**Note:** You'll see both LONG and SHORT trades in the results!

---

### Step 9: List All Backtest Results

**Request:**
```
GET {{base_url}}/strategies/backtest/results
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Filter by Strategy:**
```
GET {{base_url}}/strategies/backtest/results?strategy_id=1
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "strategy_id": 1,
    "strategy_name": "MA Crossover Strategy",
    "symbol": "BTCUSDT",
    "interval": "1h",
    "start_time": 0,
    "end_time": 0,
    "initial_capital": 10000.0,
    "final_capital": 10500.50,
    "total_return": 0.05,
    "sharpe_ratio": 1.2,
    "max_drawdown": -0.03,
    "win_rate": 0.55,
    "total_trades": 20,
    "winning_trades": 11,
    "losing_trades": 9,
    "created_at": "2026-01-29T00:00:00"
  }
]
```

---

### Step 10: Get Detailed Backtest Result

**Request:**
```
GET {{base_url}}/strategies/backtest/results/1
```

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
{
  "backtest_id": 1,
  "strategy_name": "MA Crossover Strategy",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "initial_capital": 10000.0,
  "final_capital": 10500.50,
  "metrics": {
    "total_return": 0.05,
    "sharpe_ratio": 1.2,
    "max_drawdown": -0.03,
    "win_rate": 0.55,
    "avg_win": 150.25,
    "avg_loss": -75.50,
    "profit_factor": 2.0
  },
  "total_trades": 20,
  "winning_trades": 11,
  "losing_trades": 9,
  "trades": [
    {
      "entry_time": 1704067200000,
      "exit_time": 1704070800000,
      "side": "LONG",
      "entry_price": 43250.50,
      "exit_price": 43800.75,
      "quantity": 0.001,
      "pnl": 0.55,
      "return_pct": 1.27,
      "exit_reason": "TAKE_PROFIT",
      "candles_held": 1
    }
  ],
  "equity_curve": [10000, 10050, 10100, ...],
  "created_at": "2026-01-29T00:00:00"
}
```

---

### Step 11: Test Multiple Positions (Optional)

Upload a strategy that can hold multiple positions, then run backtest with `max_positions: 3`:

**Request:**
```
POST {{base_url}}/strategies/backtest/run
```

**Body (JSON):**
```json
{
  "strategy_id": 1,
  "broker": "binance",
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500,
  "initial_capital": 10000,
  "max_positions": 3,
  "risk_per_trade": 0.02
}
```

---

## Testing Different Order Types

### Test CLOSE_ALL Action

The MA Crossover strategy uses `CLOSE_ALL` - verify it closes all positions when signal reverses.

### Test SHORT Positions

The RSI Mean Reversion strategy opens SHORT positions - verify:
- SHORT positions appear in trades with `"side": "SHORT"`
- P&L is calculated correctly for SHORT positions
- Stop loss and take profit work for SHORT positions

### Test Percentage-Based Stops

Both strategies use `stop_loss_pct` and `take_profit_pct` - verify:
- Stops are calculated correctly from percentages
- They trigger at the right prices

---

## Common Issues and Solutions

### Issue: "Invalid strategy code"
**Solution:** Ensure code is properly escaped with `\n` for newlines in JSON

### Issue: "No historical data available"
**Solution:** 
- Check symbol format (`BTCUSDT` not `BTC/USDT`)
- Try different time range or limit
- Verify broker is accessible

### Issue: "Insufficient capital"
**Solution:** Increase `initial_capital` or decrease `risk_per_trade`

### Issue: No trades executed
**Solution:**
- Check strategy logic is triggering
- Verify `quantity` is reasonable
- Check `max_positions` limit

---

## Quick Test Checklist

- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Can fetch broker data
- [ ] Strategy uploads successfully (MA Crossover)
- [ ] Strategy uploads successfully (RSI Mean Reversion)
- [ ] Backtest runs without errors
- [ ] Backtest returns metrics
- [ ] LONG trades appear in results
- [ ] SHORT trades appear in results (RSI strategy)
- [ ] CLOSE_ALL works correctly
- [ ] Stop loss/take profit trigger correctly
- [ ] Results are saved to database
- [ ] Can retrieve backtest results

---

## Example: Complete Workflow

1. **Register:** `POST /auth/register`
2. **Login:** `POST /auth/login` → Save token
3. **Check Brokers:** `GET /brokers/available`
4. **Upload Strategy 1:** `POST /strategies/upload` → Save strategy_id (1)
5. **Upload Strategy 2:** `POST /strategies/upload` → Save strategy_id (2)
6. **Run Backtest 1:** `POST /strategies/backtest/run` (strategy_id: 1) → Save backtest_id (1)
7. **Run Backtest 2:** `POST /strategies/backtest/run` (strategy_id: 2) → Save backtest_id (2)
8. **View Results:** `GET /strategies/backtest/results`
9. **Get Details:** `GET /strategies/backtest/results/1`

---

## Postman Collection Import

You can import the existing `POSTMAN_COLLECTION.json` file in Postman, then update requests with the new strategy code examples above.

---

## Tips

1. **Use Environment Variables:** Set `base_url` and `access_token` in Postman environment
2. **Auto-save Token:** Add script in Login request Tests tab to auto-save token
3. **Test Incrementally:** Test one strategy at a time
4. **Check Responses:** Verify metrics make sense (win_rate between 0-1, etc.)
5. **Compare Strategies:** Run same backtest parameters on different strategies to compare

---

## Summary

The universal strategy system now supports:
- ✅ LONG positions
- ✅ SHORT positions  
- ✅ CLOSE_ALL action
- ✅ CLOSE action
- ✅ Percentage-based stop loss/take profit
- ✅ Risk-based position sizing
- ✅ Multiple concurrent positions
- ✅ Trailing stops
- ✅ Configurable strategy parameters

All strategies follow the same universal format and can be uploaded and backtested seamlessly!
