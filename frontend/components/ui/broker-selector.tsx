"use client";

import { useState, useEffect } from "react";
import { Select } from "./select";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import api from "@/lib/api";
import config from "@/lib/config";
import { Database, TrendingUp, Calendar, Clock } from "lucide-react";

interface BrokerSelectorProps {
    onDataFetched?: (data: any) => void;
    selectedBroker?: string;
    selectedSymbol?: string;
    selectedInterval?: string;
    onSelectionChange?: (broker: string, symbol: string, interval: string) => void;
}

export default function BrokerSelector({ 
    onDataFetched, 
    selectedBroker = config.defaults.broker,
    selectedSymbol = config.defaults.symbol, 
    selectedInterval = config.defaults.interval,
    onSelectionChange 
}: BrokerSelectorProps) {
    const [availableBrokers, setAvailableBrokers] = useState<string[]>([]);
    const [broker, setBroker] = useState(selectedBroker);
    const [symbol, setSymbol] = useState(selectedSymbol);
    const [interval, setInterval] = useState(selectedInterval);
    const [limit, setLimit] = useState(config.defaults.limit);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [error, setError] = useState("");

    const intervals = config.intervals;
    const popularSymbols = config.popularSymbols;

    useEffect(() => {
        fetchAvailableBrokers();
    }, []);

    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(broker, symbol, interval);
        }
    }, [broker, symbol, interval, onSelectionChange]);

    const fetchAvailableBrokers = async () => {
        try {
            const response = await api.get("/brokers/available");
            setAvailableBrokers(response.data.brokers || ["binance"]);
        } catch (error) {
            console.error("Failed to fetch brokers:", error);
            setAvailableBrokers(["binance"]); // Fallback
        }
    };

    const handlePreviewData = async () => {
        setLoading(true);
        setError("");
        setPreviewData(null);

        try {
            const params: any = {
                broker,
                symbol,
                interval,
                limit
            };

            if (startTime) params.start_time = new Date(startTime).getTime();
            if (endTime) params.end_time = new Date(endTime).getTime();

            const response = await api.get("/brokers/ohlc", { params });
            setPreviewData(response.data);
            
            if (onDataFetched) {
                onDataFetched(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="card-hover">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-[var(--color-primary)]" />
                    Historical Market Data Configuration
                </CardTitle>
                <CardDescription>
                    Configure which historical market data to use for backtesting simulation
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Broker Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="broker">Broker</Label>
                        <Select
                            value={broker}
                            onChange={(e) => setBroker(e.target.value)}
                            placeholder="Select broker"
                        >
                            {availableBrokers.map((b) => (
                                <option key={b} value={b}>
                                    {b.charAt(0).toUpperCase() + b.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="symbol">Symbol</Label>
                        <div className="relative">
                            <Input
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder="e.g., BTCUSDT"
                                list="popular-symbols"
                            />
                            <datalist id="popular-symbols">
                                {popularSymbols.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="interval">Interval</Label>
                        <Select
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            placeholder="Select interval"
                        >
                            {intervals.map((i) => (
                                <option key={i.value} value={i.value}>
                                    {i.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="limit">Max Candles</Label>
                        <Input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value) || config.defaults.limit)}
                            min={config.validation.minLimit}
                            max={config.validation.maxLimit}
                        />
                    </div>

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

                {/* Preview Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={handlePreviewData}
                        disabled={loading || !broker || !symbol || !interval}
                        className="btn-gradient"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Fetching Data...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Preview Historical Data
                            </div>
                        )}
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Preview Data */}
                {previewData && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg animate-fade-in">
                        <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Historical Data Preview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-green-600">Broker:</span>
                                <p className="font-medium text-green-800">{previewData.broker}</p>
                            </div>
                            <div>
                                <span className="text-green-600">Symbol:</span>
                                <p className="font-medium text-green-800">{previewData.symbol}</p>
                            </div>
                            <div>
                                <span className="text-green-600">Interval:</span>
                                <p className="font-medium text-green-800">{previewData.interval}</p>
                            </div>
                            <div>
                                <span className="text-green-600">Candles:</span>
                                <p className="font-medium text-green-800">{previewData.candles?.length || 0}</p>
                            </div>
                        </div>
                        {previewData.candles && previewData.candles.length > 0 && (
                            <div className="mt-3 text-xs text-green-700">
                                <p>Latest: {new Date(previewData.candles[previewData.candles.length - 1].timestamp).toLocaleString()}</p>
                                <p>Price: ${previewData.candles[previewData.candles.length - 1].close}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}