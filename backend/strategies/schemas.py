"""
Pydantic schemas for strategy API.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class StrategyUpload(BaseModel):
    """Schema for uploading a strategy."""
    name: str = Field(..., description="Strategy name")
    description: Optional[str] = Field(None, description="Strategy description")
    code: str = Field(..., description="Python code as string")
    class_name: str = Field(..., description="Name of the strategy class")


class StrategyResponse(BaseModel):
    """Schema for strategy response."""
    id: int
    name: str
    description: Optional[str]
    class_name: str
    is_active: bool
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BacktestRequest(BaseModel):
    """Schema for backtest request."""
    strategy_id: int = Field(..., description="Strategy ID to backtest")
    broker: str = Field(..., description="Broker name (e.g., 'binance')")
    symbol: str = Field(..., description="Trading symbol (e.g., 'BTCUSDT')")
    interval: str = Field(..., description="Time interval (e.g., '1h', '1d')")
    start_time: Optional[int] = Field(None, description="Start timestamp in milliseconds")
    end_time: Optional[int] = Field(None, description="End timestamp in milliseconds")
    limit: Optional[int] = Field(None, description="Maximum number of candles")
    initial_capital: float = Field(10000.0, description="Initial capital for backtest", gt=0)
    max_positions: Optional[int] = Field(1, description="Maximum concurrent positions", ge=1)
    risk_per_trade: Optional[float] = Field(0.02, description="Risk per trade as decimal (0.02 = 2%)", ge=0, le=1)


class Trade(BaseModel):
    """Schema for individual trade."""
    entry_time: int
    exit_time: int
    side: str
    entry_price: float
    exit_price: float
    quantity: float
    pnl: float
    return_pct: float
    exit_reason: str
    candles_held: int


class BacktestMetrics(BaseModel):
    """Schema for backtest performance metrics."""
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    avg_win: float
    avg_loss: float
    profit_factor: float


class BacktestResponse(BaseModel):
    """Schema for backtest response."""
    backtest_id: Optional[int] = None
    strategy_name: str
    symbol: str
    interval: str
    initial_capital: float
    final_capital: float
    metrics: BacktestMetrics
    total_trades: int
    winning_trades: int
    losing_trades: int
    trades: List[Trade]
    equity_curve: List[float]
    created_at: Optional[datetime] = None


class BacktestResultResponse(BaseModel):
    """Schema for stored backtest result."""
    id: int
    strategy_id: int
    strategy_name: str
    symbol: str
    interval: str
    start_time: int
    end_time: int
    initial_capital: float
    final_capital: float
    total_return: float
    sharpe_ratio: Optional[float]
    max_drawdown: float
    win_rate: Optional[float]
    total_trades: int
    winning_trades: int
    losing_trades: int
    created_at: datetime
    
    class Config:
        from_attributes = True
