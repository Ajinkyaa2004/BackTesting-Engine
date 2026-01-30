"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";
import { BacktestDetail, Trade } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

function MetricCard({ title, value, subtext, type = "neutral" }: { title: string, value: string, subtext?: string, type?: "positive" | "negative" | "neutral" }) {
    const getColor = () => {
        if (type === "positive") return "text-[var(--color-trading-profit)]";
        if (type === "negative") return "text-[var(--color-trading-loss)]";
        return "text-[var(--color-primary-text)]";
    };

    return (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-sm font-medium text-[var(--color-muted)]">{title}</p>
            <div className={`text-2xl font-bold mt-1 ${getColor()}`}>{value}</div>
            {subtext && <p className="text-xs text-[var(--color-muted)] mt-1">{subtext}</p>}
        </div>
    );
}

export default function BacktestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [result, setResult] = useState<BacktestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchResult();
    }, [id]);

    const fetchResult = async () => {
        try {
            const response = await api.get(`/strategies/backtest/results/${id}`);
            setResult(response.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.detail || "Failed to load backtest.");
            } else {
                setError("Connection error.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-[var(--color-muted)]">Loading result...</div>;
    if (error) return <div className="p-8 text-center text-[var(--color-trading-loss)]">{error}</div>;
    if (!result) return <div className="p-8 text-center">Result not found.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/backtests">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Backtest Report
                            {result.created_at && (
                                <span className="text-sm border border-[var(--color-border)] px-2 py-1 rounded text-[var(--color-muted)] font-normal">
                                    {format(new Date(result.created_at), "MMM d, yyyy HH:mm")}
                                </span>
                            )}
                        </h2>
                        <p className="text-[var(--color-muted)]">
                            {result.strategy_name} • {result.symbol} • {result.interval}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/strategies`}>
                        {/* Ideally this would link to the specific strategy if we had the ID in the response. The response schema has strategy_name but strictly speaking we might want strategy_id too. The API response for result detail DOES NOt seem to include strategy_id in the Pydantic model BacktestResponse (see backend/strategies/schemas.py). It has `strategy_name`. 
                 Wait, BacktestResultResponse (list) has strategy_id. But BacktestResponse (detail) DOES NOT explicitly have `strategy_id` field in the schema definition in `schemas.py` lines 71-86. 
                 Ah, actually looking at `backend/strategies/schemas.py`:
                 class BacktestResponse(BaseModel):
                    backtest_id: Optional[int]
                    strategy_name: str
                    ...
                 
                 It does NOT return strategy_id. So I can't easily link back to the strategy from here unless I update backend. 
                 I'll just omit the link for now or link to list.
                 */}
                        <Button variant="outline">Back to History</Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Return"
                    value={`${(result.metrics.total_return).toFixed(2)}%`}
                    type={result.metrics.total_return >= 0 ? "positive" : "negative"}
                    subtext={`$${(result.final_capital - result.initial_capital).toFixed(2)} PnL`}
                />
                <MetricCard
                    title="Win Rate"
                    value={`${(result.metrics.win_rate * 100).toFixed(1)}%`}
                    subtext={`${result.winning_trades} / ${result.total_trades} Trades`}
                />
                <MetricCard
                    title="Max Drawdown"
                    value={`${(result.metrics.max_drawdown).toFixed(2)}%`}
                    type="negative"
                />
                <MetricCard
                    title="Sharpe Ratio"
                    value={(result.metrics.sharpe_ratio).toFixed(2)}
                />
            </div>

            {/* Equity Curve */}
            <Card>
                <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {(!result.equity_curve || result.equity_curve.length === 0) ? (
                        <div className="h-full flex items-center justify-center text-[var(--color-muted)]">
                            No equity curve data stored.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equity_curve.map((val: number, idx: number) => ({ index: idx, value: val }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="index" hide />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => `$${val}`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value: number | string | undefined) => [`$${Number(value || 0).toFixed(2)}`, "Equity"]}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Trade List */}
            <Card>
                <CardHeader>
                    <CardTitle>Trade Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[var(--color-muted)] uppercase bg-[var(--color-table-header)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="px-6 py-3">Side</th>
                                    <th className="px-6 py-3">Entry Time</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Exit Time</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3 text-right">PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!result.trades || result.trades.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-[var(--color-muted)]">
                                            No trades executed.
                                        </td>
                                    </tr>
                                ) : (
                                    result.trades.map((trade: Trade, i: number) => (
                                        <tr key={i} className="bg-white border-b border-[var(--color-border)] hover:bg-[var(--color-table-hover)]">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${trade.side === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {trade.side}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {format(new Date(trade.entry_time), "MMM d, HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {trade.entry_price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {format(new Date(trade.exit_time), "MMM d, HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 font-mono">
                                                {trade.exit_price.toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-medium ${trade.pnl >= 0 ? 'text-[var(--color-trading-profit)]' : 'text-[var(--color-trading-loss)]'}`}>
                                                {trade.pnl > 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
