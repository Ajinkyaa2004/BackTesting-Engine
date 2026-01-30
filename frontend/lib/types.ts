export interface Backtest {
    id: number;
    strategy_id: number;
    strategy_name: string;
    symbol: string;
    interval: string;
    start_time: number;
    end_time: number;
    initial_capital: number;
    final_capital: number;
    total_return: number;
    sharpe_ratio: number | null;
    max_drawdown: number;
    win_rate: number | null;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    created_at: string;
}

export interface Trade {
    entry_time: number;
    exit_time: number;
    side: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    pnl: number;
    return_pct: number;
    exit_reason: string;
    candles_held: number;
}

export interface BacktestMetrics {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number;
}

export interface BacktestDetail {
    backtest_id: number | null;
    strategy_name: string;
    symbol: string;
    interval: string;
    initial_capital: number;
    final_capital: number;
    metrics: BacktestMetrics;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    trades: Trade[];
    equity_curve: number[];
    created_at: string | null;
}

export interface Strategy {
    id: number;
    name: string;
    description: string | null;
    class_name: string;
    is_active: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
    code: string;
}
