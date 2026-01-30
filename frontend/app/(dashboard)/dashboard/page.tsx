"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Backtest } from "@/lib/types";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    FlaskConical, 
    LineChart, 
    TrendingUp, 
    Plus, 
    Activity, 
    DollarSign, 
    Target, 
    BarChart3,
    Clock,
    Zap,
    TrendingDown
} from "lucide-react";

interface DashboardStats {
    totalStrategies: number;
    totalBacktests: number;
    bestReturn: number;
    worstReturn: number;
    avgReturn: number;
    totalTrades: number;
    avgWinRate: number;
    activeStrategies: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStrategies: 0,
        totalBacktests: 0,
        bestReturn: 0,
        worstReturn: 0,
        avgReturn: 0,
        totalTrades: 0,
        avgWinRate: 0,
        activeStrategies: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentBacktests, setRecentBacktests] = useState<Backtest[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [strategiesRes, backtestsRes] = await Promise.all([
                    api.get("/strategies"),
                    api.get("/strategies/backtest/results")
                ]);

                const strategies = strategiesRes.data;
                const backtests = backtestsRes.data;

                // Calculate comprehensive stats
                const returns = backtests.map((b: Backtest) => b.total_return).filter((r: number) => r !== null);
                const winRates = backtests.map((b: Backtest) => b.win_rate).filter((w: number) => w !== null);
                const totalTrades = backtests.reduce((sum: number, b: Backtest) => sum + (b.total_trades || 0), 0);

                const calculatedStats: DashboardStats = {
                    totalStrategies: strategies.length,
                    totalBacktests: backtests.length,
                    bestReturn: returns.length > 0 ? Math.max(...returns) : 0,
                    worstReturn: returns.length > 0 ? Math.min(...returns) : 0,
                    avgReturn: returns.length > 0 ? returns.reduce((a: number, b: number) => a + b, 0) / returns.length : 0,
                    totalTrades: totalTrades,
                    avgWinRate: winRates.length > 0 ? winRates.reduce((a: number, b: number) => a + b, 0) / winRates.length : 0,
                    activeStrategies: strategies.length, // All strategies are considered active for now
                };

                setStats(calculatedStats);

                // Get recent 5 backtests sorted by created_at
                const sortedBacktests = backtests.sort((a: Backtest, b: Backtest) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setRecentBacktests(sortedBacktests.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 loading-skeleton rounded-lg"></div>
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-96 loading-skeleton rounded-lg"></div>
                    <div className="h-96 loading-skeleton rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900 mb-2">
                            Welcome to Backtesting Platform
                        </h1>
                        <p className="text-blue-700">
                            Monitor your algorithmic trading performance and manage your strategies
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Total Strategies</CardTitle>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FlaskConical className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-800">{stats.totalStrategies}</div>
                        <p className="text-xs text-blue-600 mt-1">
                            {stats.activeStrategies} active algorithms
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Best Performance</CardTitle>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-800">
                            +{stats.bestReturn.toFixed(1)}%
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            Avg: {stats.avgReturn > 0 ? '+' : ''}{stats.avgReturn.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Total Backtests</CardTitle>
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-800">{stats.totalBacktests}</div>
                        <p className="text-xs text-purple-600 mt-1">
                            {stats.totalTrades.toLocaleString()} total trades
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">Win Rate</CardTitle>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-800">
                            {stats.avgWinRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-orange-600 mt-1">
                            Average across all strategies
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 card-hover">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                                    Recent Backtests
                                </CardTitle>
                                <CardDescription>
                                    Your latest simulation runs and their performance
                                </CardDescription>
                            </div>
                            <Link href="/backtests">
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentBacktests.length === 0 ? (
                            <div className="text-center py-12">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--color-primary-text)] mb-2">
                                    No backtests yet
                                </h3>
                                <p className="text-[var(--color-muted)] mb-6">
                                    Start by creating a strategy and running your first backtest
                                </p>
                                <Link href="/strategies/new">
                                    <Button className="btn-gradient">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Strategy
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentBacktests.map((backtest, index) => (
                                    <div 
                                        key={backtest.id} 
                                        className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-table-hover)] transition-colors animate-fade-in"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                backtest.total_return >= 0 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                {backtest.total_return >= 0 ? 
                                                    <TrendingUp className="h-5 w-5" /> : 
                                                    <TrendingDown className="h-5 w-5" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[var(--color-primary-text)]">
                                                    {backtest.strategy_name}
                                                </p>
                                                <p className="text-sm text-[var(--color-muted)]">
                                                    {backtest.symbol} • {backtest.interval} • {formatDate(backtest.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${
                                                backtest.total_return >= 0 
                                                    ? 'text-[var(--color-trading-profit)]' 
                                                    : 'text-[var(--color-trading-loss)]'
                                            }`}>
                                                {backtest.total_return > 0 ? "+" : ""}{backtest.total_return.toFixed(2)}%
                                            </p>
                                            <p className="text-sm text-[var(--color-muted)]">
                                                {backtest.total_trades} trades • {backtest.win_rate?.toFixed(1)}% win rate
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Performance Summary */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-[var(--color-primary)]" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Manage your trading strategies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/strategies/new">
                                <Button className="w-full justify-start btn-gradient">
                                    <Plus className="mr-2 h-4 w-4" /> 
                                    Create New Strategy
                                </Button>
                            </Link>
                            <Link href="/strategies">
                                <Button className="w-full justify-start" variant="outline">
                                    <FlaskConical className="mr-2 h-4 w-4" /> 
                                    View All Strategies
                                </Button>
                            </Link>
                            <Link href="/backtests">
                                <Button className="w-full justify-start" variant="outline">
                                    <LineChart className="mr-2 h-4 w-4" /> 
                                    Backtest History
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Performance Summary */}
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
                                Performance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--color-muted)]">Best Return</span>
                                <span className="font-semibold text-[var(--color-trading-profit)]">
                                    +{stats.bestReturn.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--color-muted)]">Worst Return</span>
                                <span className="font-semibold text-[var(--color-trading-loss)]">
                                    {stats.worstReturn.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--color-muted)]">Average Return</span>
                                <span className={`font-semibold ${
                                    stats.avgReturn >= 0 
                                        ? 'text-[var(--color-trading-profit)]' 
                                        : 'text-[var(--color-trading-loss)]'
                                }`}>
                                    {stats.avgReturn > 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[var(--color-muted)]">Total Trades</span>
                                <span className="font-semibold text-[var(--color-primary-text)]">
                                    {stats.totalTrades.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
