"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Backtest } from "@/lib/types";

export default function BacktestsPage() {
    const [backtests, setBacktests] = useState<Backtest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBacktests();
    }, []);

    const fetchBacktests = async () => {
        try {
            const response = await api.get("/strategies/backtest/results");
            setBacktests(response.data);
        } catch (error) {
            console.error("Failed to fetch backtests", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-[var(--color-muted)]">Loading history...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-primary-text)]">Backtest History</h2>
                <p className="text-[var(--color-muted)]">Archive of all your strategy simulations.</p>
            </div>

            <Card>
                <CardHeader className="px-6 py-4 border-b border-[var(--color-border)]">
                    <CardTitle className="text-base text-[var(--color-secondary-text)]">Simulation Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {backtests.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-muted)]">
                            No backtests found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run Date</TableHead>
                                    <TableHead>Strategy</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Timeframe</TableHead>
                                    <TableHead className="text-right">Return</TableHead>
                                    <TableHead className="text-right">Sharpe</TableHead>
                                    <TableHead className="text-right">Max DD</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backtests.map((bt) => (
                                    <TableRow key={bt.id}>
                                        <TableCell className="text-[var(--color-muted)] font-mono text-xs">
                                            {format(new Date(bt.created_at), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell className="font-medium">{bt.strategy_name}</TableCell>
                                        <TableCell>{bt.symbol}</TableCell>
                                        <TableCell>{bt.interval}</TableCell>
                                        <TableCell className={`text-right font-medium ${bt.total_return >= 0 ? 'text-[var(--color-trading-profit)]' : 'text-[var(--color-trading-loss)]'}`}>
                                            {bt.total_return > 0 ? "+" : ""}{bt.total_return.toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-right">{bt.sharpe_ratio?.toFixed(2) || "-"}</TableCell>
                                        <TableCell className="text-right text-[var(--color-trading-loss)]">
                                            {bt.max_drawdown.toFixed(2)}%
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/backtests/${bt.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Eye className="h-4 w-4 text-[var(--color-primary)]" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
