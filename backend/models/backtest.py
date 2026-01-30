"""
Backtest results model for storing backtest execution results.
"""
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from models.base import BaseModel


class Backtest(BaseModel):
    """
    Backtest results model - stores backtest execution results.
    """
    __tablename__ = "backtests"
    
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Backtest parameters
    symbol = Column(String(50), nullable=False)
    interval = Column(String(10), nullable=False)
    start_time = Column(Integer, nullable=False)  # Timestamp in milliseconds
    end_time = Column(Integer, nullable=False)    # Timestamp in milliseconds
    
    # Capital
    initial_capital = Column(Float, nullable=False)
    final_capital = Column(Float, nullable=False)
    
    # Performance metrics
    total_return = Column(Float, nullable=False)  # As decimal (e.g., 0.15 for 15%)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=False)   # As decimal (e.g., -0.08 for -8%)
    win_rate = Column(Float, nullable=True)       # As decimal (e.g., 0.55 for 55%)
    
    # Trade statistics
    total_trades = Column(Integer, nullable=False, default=0)
    winning_trades = Column(Integer, nullable=False, default=0)
    losing_trades = Column(Integer, nullable=False, default=0)
    
    # Store all trades as JSON
    trades_json = Column(JSON, nullable=True)
    
    # Relationships
    strategy = relationship("Strategy", backref="backtests")
    user = relationship("User", backref="backtests")
    
    def __repr__(self):
        return f"<Backtest(id={self.id}, strategy_id={self.strategy_id}, return={self.total_return:.2%})>"
