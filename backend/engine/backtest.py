"""
Backtesting engine - executes strategies on historical data.
"""
from typing import List, Dict, Any, Optional
from core.candle import Candle
from strategies.base import BaseStrategy
from strategies.loader import StrategyLoader
from brokers.base import BrokerBase
from brokers.factory import BrokerFactory
from engine.position import Position
import math


class BacktestingEngine:
    """
    Backtesting engine that executes strategies on historical candles.
    """
    
    def __init__(self, initial_capital: float = 10000.0, max_positions: int = 1):
        """
        Initialize backtesting engine.
        
        Args:
            initial_capital: Starting capital for backtest
            max_positions: Maximum concurrent positions allowed
        """
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.max_positions = max_positions
        self.positions: List[Position] = []
        self.closed_trades: List[Dict[str, Any]] = []
        self.equity_curve: List[float] = []
    
    def run_backtest(
        self,
        strategy_code: str,
        class_name: str,
        broker_name: str,
        symbol: str,
        interval: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: Optional[int] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run backtest on historical data.
        
        Args:
            strategy_code: Python code string for strategy
            class_name: Name of strategy class
            broker_name: Broker name (e.g., "binance")
            symbol: Trading symbol
            interval: Time interval
            start_time: Start timestamp (optional)
            end_time: End timestamp (optional)
            limit: Maximum candles (optional)
            
        Returns:
            Dictionary with backtest results and metrics
        """
        # Reset state
        self.capital = self.initial_capital
        self.positions = []
        self.closed_trades = []
        self.equity_curve = [self.initial_capital]
        
        # Create broker instance
        broker = BrokerFactory.create_broker(broker_name)
        
        # Fetch historical data
        candles = broker.get_ohlc(
            symbol=symbol,
            interval=interval,
            limit=limit,
            start_time=start_time,
            end_time=end_time
        )
        
        if not candles:
            raise ValueError("No historical data available for backtest")
        
        # Prepare strategy config
        strategy_config = config or {}
        strategy_config.update({
            "max_positions": self.max_positions,
            "initial_capital": self.initial_capital,
            "risk_per_trade": strategy_config.get("risk_per_trade", 0.02)
        })
        
        # Load and instantiate strategy
        strategy = StrategyLoader.create_strategy_instance(
            code=strategy_code,
            class_name=class_name,
            broker=broker,
            config=strategy_config
        )
        
        # Initialize strategy
        strategy.initialize()
        
        # Process each candle
        for candle in candles:
            self._process_candle(strategy, candle)
        
        # Close any remaining positions at the end
        for position in self.positions[:]:
            exit_price = candles[-1].close
            self._close_position(position, exit_price, "END_OF_BACKTEST", candles[-1].timestamp)
        
        # Calculate metrics
        metrics = self._calculate_metrics()
        
        return {
            "initial_capital": self.initial_capital,
            "final_capital": self.capital,
            "metrics": metrics,
            "trades": self.closed_trades,
            "equity_curve": self.equity_curve,
            "total_trades": len(self.closed_trades),
            "winning_trades": sum(1 for t in self.closed_trades if t["pnl"] > 0),
            "losing_trades": sum(1 for t in self.closed_trades if t["pnl"] <= 0)
        }
    
    def _process_candle(self, strategy: BaseStrategy, candle: Candle):
        """
        Process a single candle through the strategy.
        
        Args:
            strategy: Strategy instance
            candle: Current candle
        """
        # Update positions (check stop loss, take profit, trailing stops)
        for position in self.positions[:]:
            position.increment_candles_held()
            
            # Update trailing stop
            if position.trailing_stop:
                position.update_trailing_stop(candle)
            
            # Check stop loss
            if position.check_stop_loss(candle):
                exit_price = position.stop_loss
                self._close_position(position, exit_price, "STOP_LOSS", candle.timestamp)
                continue
            
            # Check take profit
            if position.check_take_profit(candle):
                exit_price = position.take_profit
                self._close_position(position, exit_price, "TAKE_PROFIT", candle.timestamp)
                continue
        
        # Get strategy signal (can be None, single order, or list of orders)
        order_result = strategy.on_candle(candle)
        
        if order_result:
            # Handle both single order and list of orders
            if isinstance(order_result, list):
                for order in order_result:
                    if order:
                        self._execute_order(order, candle)
            else:
                self._execute_order(order_result, candle)
        
        # Update equity curve
        self._update_equity_curve(candle)
    
    def _execute_order(self, order: Dict[str, Any], candle: Candle):
        """
        Execute an order (simulated) - Enhanced to support all order types.
        
        Supported actions:
        - BUY: Open LONG position
        - SELL: Open SHORT position (if no LONG position) or close LONG position
        - CLOSE: Close specific position
        - CLOSE_ALL: Close all positions
        """
        action = order.get("action", "").upper()
        quantity = order.get("quantity", 0)
        order_type = order.get("order_type", "MARKET").upper()
        price = order.get("price")
        stop_loss = order.get("stop_loss")
        stop_loss_pct = order.get("stop_loss_pct")
        take_profit = order.get("take_profit")
        take_profit_pct = order.get("take_profit_pct")
        trailing_stop = order.get("trailing_stop")
        position_side = order.get("position_side", "LONG").upper()
        exit_reason = order.get("exit_reason", "STRATEGY_SIGNAL")
        
        # Handle CLOSE_ALL action
        if action == "CLOSE_ALL":
            for position in self.positions[:]:
                fill_price = candle.close
                self._close_position(position, fill_price, exit_reason, candle.timestamp)
            return
        
        # Handle CLOSE action (close specific position)
        if action == "CLOSE":
            if not self.positions:
                return
            
            # Find position to close (by side if specified)
            position = None
            if position_side:
                for pos in self.positions:
                    if pos.side == position_side:
                        position = pos
                        break
            else:
                # Close first position (FIFO)
                position = self.positions[0] if self.positions else None
            
            if position:
                fill_price = candle.close if order_type == "MARKET" or price is None else price
                if order_type == "LIMIT" and price:
                    if not (candle.low <= price <= candle.high):
                        return  # Limit not filled
                self._close_position(position, fill_price, exit_reason, candle.timestamp)
            return
        
        # Calculate stop loss and take profit from percentages if provided
        entry_price = price if price else candle.close
        
        if stop_loss_pct and not stop_loss:
            if action == "BUY" or position_side == "LONG":
                stop_loss = entry_price * (1 - stop_loss_pct)
            else:  # SHORT
                stop_loss = entry_price * (1 + stop_loss_pct)
        
        if take_profit_pct and not take_profit:
            if action == "BUY" or position_side == "LONG":
                take_profit = entry_price * (1 + take_profit_pct)
            else:  # SHORT
                take_profit = entry_price * (1 - take_profit_pct)
        
        # Handle BUY action
        if action == "BUY":
            # Determine fill price
            if order_type == "MARKET" or price is None:
                fill_price = candle.close
            elif order_type == "LIMIT":
                if candle.low <= price <= candle.high:
                    fill_price = price
                else:
                    return  # Order not filled
            else:
                fill_price = candle.close  # Default to market
            
            # Check if we have enough capital
            cost = fill_price * quantity
            if cost > self.capital:
                return  # Insufficient capital
            
            # Check max positions limit
            if len(self.positions) >= self.max_positions:
                return
            
            # Open LONG position
            position = Position(
                side="LONG",
                entry_price=fill_price,
                quantity=quantity,
                entry_time=candle.timestamp,
                stop_loss=stop_loss,
                take_profit=take_profit,
                trailing_stop=trailing_stop
            )
            self.positions.append(position)
            self.capital -= cost
        
        # Handle SELL action
        elif action == "SELL":
            # Check if we have LONG positions to close
            long_positions = [p for p in self.positions if p.side == "LONG"]
            
            if long_positions:
                # Close first LONG position (FIFO)
                position = long_positions[0]
                
                # Determine fill price
                if order_type == "MARKET" or price is None:
                    fill_price = candle.close
                elif order_type == "LIMIT":
                    if candle.low <= price <= candle.high:
                        fill_price = price
                    else:
                        return  # Order not filled
                else:
                    fill_price = candle.close
                
                self._close_position(position, fill_price, exit_reason, candle.timestamp)
            else:
                # No LONG position - open SHORT position
                # Determine fill price
                if order_type == "MARKET" or price is None:
                    fill_price = candle.close
                elif order_type == "LIMIT":
                    if candle.low <= price <= candle.high:
                        fill_price = price
                    else:
                        return  # Order not filled
                else:
                    fill_price = candle.close
                
                # Check max positions limit
                if len(self.positions) >= self.max_positions:
                    return
                
                # For SHORT, we need margin (simplified: same as cost)
                margin_required = fill_price * quantity
                if margin_required > self.capital:
                    return  # Insufficient capital
                
                # Open SHORT position
                position = Position(
                    side="SHORT",
                    entry_price=fill_price,
                    quantity=quantity,
                    entry_time=candle.timestamp,
                    stop_loss=stop_loss,
                    take_profit=take_profit,
                    trailing_stop=trailing_stop
                )
                self.positions.append(position)
                self.capital -= margin_required  # Reserve margin
    
    def _close_position(
        self,
        position: Position,
        exit_price: float,
        exit_reason: str,
        exit_time: int
    ):
        """
        Close a position and record the trade.
        Enhanced to handle both LONG and SHORT positions.
        
        Args:
            position: Position to close
            exit_price: Exit price
            exit_reason: Reason for exit
            exit_time: Exit timestamp
        """
        if position not in self.positions:
            return
        
        # Calculate P&L
        pnl = position.calculate_realized_pnl(exit_price)
        
        # Return capital/margin based on position side
        if position.side == "LONG":
            # Return capital from sale
            self.capital += (exit_price * position.quantity)
        else:  # SHORT
            # Return margin + profit (or subtract loss)
            self.capital += (position.entry_price * position.quantity)  # Return margin
            self.capital += pnl  # Add profit (pnl is positive for profit, negative for loss)
        
        # Record trade
        trade = {
            "entry_time": position.entry_time,
            "exit_time": exit_time,
            "side": position.side,
            "entry_price": position.entry_price,
            "exit_price": exit_price,
            "quantity": position.quantity,
            "pnl": pnl,
            "return_pct": (pnl / (position.entry_price * position.quantity)) * 100,
            "exit_reason": exit_reason,
            "candles_held": position.candles_held
        }
        
        self.closed_trades.append(trade)
        self.positions.remove(position)
    
    def _update_equity_curve(self, candle: Candle):
        """
        Update equity curve with current capital + unrealized P&L.
        
        Args:
            candle: Current candle
        """
        unrealized_pnl = sum(
            pos.calculate_unrealized_pnl(candle.close)
            for pos in self.positions
        )
        equity = self.capital + unrealized_pnl
        self.equity_curve.append(equity)
    
    def _calculate_metrics(self) -> Dict[str, float]:
        """
        Calculate performance metrics.
        
        Returns:
            Dictionary with performance metrics
        """
        if not self.closed_trades:
            return {
                "total_return": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "win_rate": 0.0,
                "avg_win": 0.0,
                "avg_loss": 0.0,
                "profit_factor": 0.0
            }
        
        # Total return
        total_return = (self.capital - self.initial_capital) / self.initial_capital
        
        # Win rate
        winning_trades = [t for t in self.closed_trades if t["pnl"] > 0]
        losing_trades = [t for t in self.closed_trades if t["pnl"] <= 0]
        win_rate = len(winning_trades) / len(self.closed_trades) if self.closed_trades else 0.0
        
        # Average win/loss
        avg_win = sum(t["pnl"] for t in winning_trades) / len(winning_trades) if winning_trades else 0.0
        avg_loss = abs(sum(t["pnl"] for t in losing_trades) / len(losing_trades)) if losing_trades else 0.0
        
        # Profit factor
        total_profit = sum(t["pnl"] for t in winning_trades) if winning_trades else 0.0
        total_loss = abs(sum(t["pnl"] for t in losing_trades)) if losing_trades else 0.0
        profit_factor = total_profit / total_loss if total_loss > 0 else 0.0
        
        # Sharpe ratio (simplified - using returns)
        returns = [(self.equity_curve[i] - self.equity_curve[i-1]) / self.equity_curve[i-1]
                   for i in range(1, len(self.equity_curve)) if self.equity_curve[i-1] > 0]
        
        if returns:
            avg_return = sum(returns) / len(returns)
            variance = sum((r - avg_return) ** 2 for r in returns) / len(returns)
            std_dev = math.sqrt(variance) if variance > 0 else 0.0
            sharpe_ratio = (avg_return / std_dev) * math.sqrt(252) if std_dev > 0 else 0.0
        else:
            sharpe_ratio = 0.0
        
        # Max drawdown
        max_drawdown = self._calculate_max_drawdown()
        
        return {
            "total_return": total_return,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "win_rate": win_rate,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "profit_factor": profit_factor
        }
    
    def _calculate_max_drawdown(self) -> float:
        """
        Calculate maximum drawdown from equity curve.
        
        Returns:
            Maximum drawdown as decimal (e.g., -0.08 for -8%)
        """
        if len(self.equity_curve) < 2:
            return 0.0
        
        peak = self.equity_curve[0]
        max_dd = 0.0
        
        for equity in self.equity_curve[1:]:
            if equity > peak:
                peak = equity
            else:
                dd = (equity - peak) / peak
                if dd < max_dd:
                    max_dd = dd
        
        return max_dd
