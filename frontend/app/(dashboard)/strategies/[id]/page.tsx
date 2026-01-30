"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import config from "@/lib/config";
import axios from "axios";
import { BacktestDetail, Strategy, Trade } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BrokerSelector from "@/components/ui/broker-selector";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import {
    Play,
    Settings2,
    ArrowLeft,
    AlertTriangle,
    TrendingDown,
    Activity,
    TrendingUp,
    DollarSign,
    Target,
    BarChart3
} from "lucide-react";
import Link from "next/link";

// Reusable Metric Card Component
function MetricCard({ 
    title, 
    value, 
    subtext, 
    type = "neutral", 
    icon: Icon 
}: { 
    title: string, 
    value: string, 
    subtext?: string, 
    type?: "positive" | "negative" | "neutral",
    icon?: any 
}) {
    const getColor = () => {
        if (type === "positive") return "text-[var(--color-trading-profit)]";
        if (type === "negative") return "text-[var(--color-trading-loss)]";
        return "text-[var(--color-primary-text)]";
    };

    const getBgColor = () => {
        if (type === "positive") return "from-green-50 to-emerald-50 border-green-200";
        if (type === "negative") return "from-red-50 to-pink-50 border-red-200";
        return "from-blue-50 to-indigo-50 border-blue-200";
    };

    return (
        <Card className={`card-hover bg-gradient-to-br ${getBgColor()}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <div className={`text-2xl font-bold mt-1 ${getColor()}`}>{value}</div>
                        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
                    </div>
                    {Icon && (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            type === "positive" ? "bg-green-500" :
                            type === "negative" ? "bg-red-500" : "bg-blue-500"
                        }`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function StrategyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Strategy State
    const [strategy, setStrategy] = useState<Strategy | null>(null);

    // Backtest Config State
    const [broker, setBroker] = useState(config.defaults.broker);
    const [symbol, setSymbol] = useState(config.defaults.symbol);
    const [interval, setInterval] = useState(config.defaults.interval);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [initialCapital, setInitialCapital] = useState(config.defaults.initialCapital);
    const [riskPerTrade, setRiskPerTrade] = useState(config.defaults.riskPerTrade);
    const [maxPositions, setMaxPositions] = useState(config.defaults.maxPositions);
    const [limit, setLimit] = useState(config.defaults.limit);

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<BacktestDetail | null>(null);
    const [error, setError] = useState("");
    const [loadingStrategy, setLoadingStrategy] = useState(true);
    const [marketData, setMarketData] = useState<any>(null);

    useEffect(() => {
        fetchStrategy();
    }, [id]);

    const fetchStrategy = async () => {
        try {
            const response = await api.get(`/strategies/${id}`);
            setStrategy(response.data);
        } catch (err: unknown) {
            setError("Failed to load strategy details.");
        } finally {
            setLoadingStrategy(false);
        }
    };

    const handleBrokerSelectionChange = (newBroker: string, newSymbol: string, newInterval: string) => {
        setBroker(newBroker);
        setSymbol(newSymbol);
        setInterval(newInterval);
    };

    const handleMarketDataFetched = (data: any) => {
        setMarketData(data);
    };

    const handleRunBacktest = async () => {
        setIsRunning(true);
        setError("");
        setResult(null);

        // Convert dates to UNIX timestamps (ms) if provided
        let startTs = null;
        let endTs = null;

        if (startTime) startTs = new Date(startTime).getTime();
        if (endTime) endTs = new Date(endTime).getTime();

        const backtestData = {
            strategy_id: parseInt(id),
            broker: broker,
            symbol: symbol,
            interval: interval,
            initial_capital: initialCapital,
            start_time: startTs,
            end_time: endTs,
            limit: limit,
            config: {
                risk_per_trade: riskPerTrade / 100, // Convert percentage to decimal
                max_positions: maxPositions,
                initial_capital: initialCapital
            }
        };

        try {
            const response = await api.post("/strategies/backtest/run", backtestData);
            setResult(response.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || "Backtest failed");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsRunning(false);
        }
    };

    if (loadingStrategy) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 loading-skeleton rounded-lg"></div>
                    <div>
                        <div className="h-6 w-48 loading-skeleton mb-2"></div>
                        <div className="h-4 w-64 loading-skeleton"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-96 loading-skeleton rounded-lg"></div>
                    <div className="h-96 loading-skeleton rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!strategy) {
        return (
            <div className="text-center py-12 animate-fade-in">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-[var(--color-primary-text)] mb-2">Strategy Not Found</h2>
                <p className="text-[var(--color-muted)] mb-6">The strategy you're looking for doesn't exist or has been deleted.</p>
                <Link href="/strategies">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Strategies
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/strategies">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-primary-text)]">
                            {strategy.name}
                        </h1>
                        <p className="text-[var(--color-muted)]">
                            {strategy.description || "No description provided"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-muted)]">Class:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {strategy.class_name}
                    </code>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Market Data Configuration */}
                    <BrokerSelector
                        selectedBroker={broker}
                        selectedSymbol={symbol}
                        selectedInterval={interval}
                        onSelectionChange={handleBrokerSelectionChange}
                        onDataFetched={handleMarketDataFetched}
                    />

                    {/* Backtest Parameters */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-[var(--color-primary)]" />
                                Historical Backtest Configuration
                            </CardTitle>
                            <CardDescription className="text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                                ⚠️ <strong>IMPORTANT:</strong> This is historical simulation only. No real money or live trading is involved. 
                                The strategy will be tested against past market data to evaluate performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                                    <Input
                                        type="number"
                                        value={initialCapital}
                                        onChange={(e) => setInitialCapital(parseFloat(e.target.value) || config.defaults.initialCapital)}
                                        min={config.validation.minInitialCapital}
                                        max={config.validation.maxInitialCapital}
                                        step="100"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="riskPerTrade">Risk per Trade (%)</Label>
                                    <Input
                                        type="number"
                                        value={riskPerTrade}
                                        onChange={(e) => setRiskPerTrade(parseFloat(e.target.value) || config.defaults.riskPerTrade)}
                                        min={config.validation.minRiskPerTrade}
                                        max={config.validation.maxRiskPerTrade}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxPositions">Max Positions</Label>
                                    <Input
                                        type="number"
                                        value={maxPositions}
                                        onChange={(e) => setMaxPositions(parseInt(e.target.value) || 1)}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="limit">Max Candles</Label>
                                    <Input
                                        type="number"
                                        value={limit}
                                        onChange={(e) => setLimit(parseInt(e.target.value) || config.defaults.limit)}
                                        min={config.validation.minLimit}
                                        max={config.validation.maxLimit}
                                        step="100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startTime">Start Date (Optional)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endTime">End Date (Optional)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleRunBacktest}
                                disabled={isRunning || !marketData}
                                className="w-full btn-gradient"
                                size="lg"
                            >
                                {isRunning ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Running Historical Simulation...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Play className="h-5 w-5" />
                                        Run Historical Backtest
                                    </div>
                                )}
                            </Button>

                            {!marketData && (
                                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    Please preview historical market data first to ensure data availability before running the backtest simulation.
                                </p>
                            )}

                            {/* Clear disclaimer */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-sm font-bold">i</span>
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">Historical Simulation Only</p>
                                        <p>This backtest uses <strong>past market data</strong> to simulate how your strategy would have performed. 
                                        No real trades are executed, no real money is used, and no live market connections are made.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    {error && (
                        <Card className="border-red-200 bg-red-50 animate-fade-in">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <span className="font-medium text-red-800">Error</span>
                                </div>
                                <p className="text-red-700 mt-2">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Clear Results Header */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                    <h3 className="font-semibold text-green-800">Historical Backtest Results</h3>
                                </div>
                                <p className="text-sm text-green-700">
                                    These results show how your strategy performed on <strong>historical data</strong>. 
                                    This is a simulation - no real trades were executed.
                                </p>
                            </div>

                            {/* Performance Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <MetricCard
                                    title="Total Return"
                                    value={`${result.metrics?.total_return?.toFixed(2) || '0.00'}%`}
                                    type={result.metrics?.total_return && result.metrics.total_return > 0 ? "positive" : "negative"}
                                    icon={TrendingUp}
                                />
                                <MetricCard
                                    title="Final Capital"
                                    value={`$${result.final_capital?.toLocaleString() || '0'}`}
                                    type={result.final_capital && result.final_capital > result.initial_capital ? "positive" : "negative"}
                                    icon={DollarSign}
                                />
                                <MetricCard
                                    title="Total Trades"
                                    value={result.total_trades?.toString() || '0'}
                                    icon={Activity}
                                />
                                <MetricCard
                                    title="Win Rate"
                                    value={`${result.metrics?.win_rate?.toFixed(1) || '0.0'}%`}
                                    type={result.metrics?.win_rate && result.metrics.win_rate > 50 ? "positive" : "negative"}
                                    icon={Target}
                                />
                                <MetricCard
                                    title="Max Drawdown"
                                    value={`${result.metrics?.max_drawdown?.toFixed(2) || '0.00'}%`}
                                    type="negative"
                                    icon={TrendingDown}
                                />
                                <MetricCard
                                    title="Sharpe Ratio"
                                    value={result.metrics?.sharpe_ratio?.toFixed(2) || '0.00'}
                                    type={result.metrics?.sharpe_ratio && result.metrics.sharpe_ratio > 1 ? "positive" : "neutral"}
                                    icon={BarChart3}
                                />
                            </div>

                            {/* Equity Curve */}
                            {result.equity_curve && result.equity_curve.length > 0 && (
                                <Card className="card-hover">
                                    <CardHeader>
                                        <CardTitle>Historical Equity Curve</CardTitle>
                                        <CardDescription>Simulated portfolio value over historical time period</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 chart-container">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={result.equity_curve.map((value, index) => ({ index, value }))}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                                    <XAxis dataKey="index" stroke="#6b7280" />
                                                    <YAxis stroke="#6b7280" />
                                                    <Tooltip 
                                                        formatter={(value: any) => [`${value.toLocaleString()}`, 'Portfolio Value']}
                                                        labelFormatter={(index) => `Candle ${index}`}
                                                    />
                                                    <ReferenceLine y={result.initial_capital} stroke="#ef4444" strokeDasharray="5 5" />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="value" 
                                                        stroke="#2563eb" 
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Trade Log */}
                            {result.trades && result.trades.length > 0 && (
                                <Card className="card-hover">
                                    <CardHeader>
                                        <CardTitle>Simulated Trade History</CardTitle>
                                        <CardDescription>Historical trades that would have been executed (simulation only)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm table-enhanced">
                                                <thead>
                                                    <tr className="border-b border-[var(--color-border)]">
                                                        <th className="text-left p-2 font-medium">Type</th>
                                                        <th className="text-left p-2 font-medium">Entry</th>
                                                        <th className="text-left p-2 font-medium">Exit</th>
                                                        <th className="text-left p-2 font-medium">Quantity</th>
                                                        <th className="text-left p-2 font-medium">P&L</th>
                                                        <th className="text-left p-2 font-medium">Return</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.trades.slice(0, 10).map((trade: Trade, index: number) => (
                                                        <tr key={index} className="border-b border-[var(--color-border)] hover:bg-[var(--color-table-hover)]">
                                                            <td className="p-2">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                    trade.side === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {trade.side}
                                                                </span>
                                                            </td>
                                                            <td className="p-2">${trade.entry_price?.toFixed(2)}</td>
                                                            <td className="p-2">${trade.exit_price?.toFixed(2)}</td>
                                                            <td className="p-2">{trade.quantity?.toFixed(4)}</td>
                                                            <td className={`p-2 font-medium ${
                                                                trade.pnl && trade.pnl > 0 ? 'text-[var(--color-trading-profit)]' : 'text-[var(--color-trading-loss)]'
                                                            }`}>
                                                                ${trade.pnl?.toFixed(2)}
                                                            </td>
                                                            <td className={`p-2 font-medium ${
                                                                trade.return_pct && trade.return_pct > 0 ? 'text-[var(--color-trading-profit)]' : 'text-[var(--color-trading-loss)]'
                                                            }`}>
                                                                {trade.return_pct?.toFixed(2)}%
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {result.trades.length > 10 && (
                                                <p className="text-center text-sm text-[var(--color-muted)] mt-4">
                                                    Showing first 10 of {result.trades.length} trades
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {!result && !error && !isRunning && (
                        <Card className="card-hover">
                            <CardContent className="p-12 text-center">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--color-primary-text)] mb-2">
                                    Ready for Historical Backtest
                                </h3>
                                <p className="text-[var(--color-muted)]">
                                    Configure your parameters and run a historical simulation to see how your strategy would have performed on past data.
                                </p>
                                <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <strong>Note:</strong> This is simulation only - no real trading occurs
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}