"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Plus, Code, Trash2, PlayCircle, Edit, Eye, Calendar, User, TrendingUp } from "lucide-react";
import { Strategy } from "@/lib/types";

export default function StrategiesPage() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const response = await api.get("/strategies");
            setStrategies(response.data);
        } catch (error) {
            console.error("Failed to fetch strategies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this strategy? This action cannot be undone.")) return;
        
        setDeleteLoading(id);
        try {
            await api.delete(`/strategies/${id}`);
            setStrategies(strategies.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete strategy", error);
            alert("Failed to delete strategy. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-48 loading-skeleton mb-2"></div>
                        <div className="h-4 w-64 loading-skeleton"></div>
                    </div>
                    <div className="h-10 w-32 loading-skeleton"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 loading-skeleton rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-primary-text)] mb-2">
                        Trading Strategies
                    </h1>
                    <p className="text-[var(--color-muted)] text-lg">
                        Create, manage, and backtest your algorithmic trading strategies
                    </p>
                </div>
                <Link href="/strategies/new">
                    <Button className="btn-gradient shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Strategy
                    </Button>
                </Link>
            </div>

            {/* Important Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Backtesting Platform - Historical Simulation Only</p>
                        <p>All strategy testing uses <strong>historical market data</strong> for simulation purposes. 
                        No real trades are executed, no real money is involved, and no live market connections are made. 
                        This platform is designed for strategy development and historical performance analysis.</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Strategies</p>
                                <p className="text-3xl font-bold text-blue-800">{strategies.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Code className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Active Strategies</p>
                                <p className="text-3xl font-bold text-green-800">{strategies.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Avg Performance</p>
                                <p className="text-3xl font-bold text-purple-800">+12.5%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <PlayCircle className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Strategies Grid */}
            {strategies.length === 0 ? (
                <Card className="card-hover">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--color-primary-text)] mb-2">
                            No strategies yet
                        </h3>
                        <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto">
                            Get started by creating your first trading strategy. You can write custom algorithms 
                            or use our pre-built templates.
                        </p>
                        <Link href="/strategies/new">
                            <Button className="btn-gradient">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Strategy
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {strategies.map((strategy, index) => (
                        <Card 
                            key={strategy.id} 
                            className="card-hover group animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-semibold text-[var(--color-primary-text)] group-hover:text-[var(--color-primary)] transition-colors">
                                            {strategy.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-[var(--color-muted)] mt-1 line-clamp-2">
                                            {strategy.description || "No description provided"}
                                        </CardDescription>
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                                        <Code className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                                {/* Strategy Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                        <User className="h-3 w-3" />
                                        <span>Class: {strategy.class_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                        <Calendar className="h-3 w-3" />
                                        <span>Created: {formatDate(strategy.created_at)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Link href={`/strategies/${strategy.id}`} className="flex-1">
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            className="w-full btn-gradient text-xs"
                                        >
                                            <PlayCircle className="h-3 w-3 mr-1" />
                                            Historical Backtest
                                        </Button>
                                    </Link>
                                    
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="px-3"
                                        title="View Code"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                    
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="px-3"
                                        title="Edit Strategy"
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="px-3"
                                        onClick={() => handleDelete(strategy.id)}
                                        disabled={deleteLoading === strategy.id}
                                        title="Delete Strategy"
                                    >
                                        {deleteLoading === strategy.id ? (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Trash2 className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
