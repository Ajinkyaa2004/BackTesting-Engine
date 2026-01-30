"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Code, TrendingUp, Activity, Target, Zap } from "lucide-react";

interface StrategyTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    type: "Trend Following" | "Mean Reversion" | "Momentum" | "Custom";
    code: string;
    className: string;
    features: string[];
}

const strategyTemplates: StrategyTemplate[] = [
    {
        id: "ma_crossover",
        name: "Moving Average Crossover",
        description: "Simple trend-following strategy using fast and slow moving averages. Enters long positions when fast MA crosses above slow MA.",
        difficulty: "Beginner",
        type: "Trend Following",
        className: "MACrossoverStrategy",
        features: ["Long-only trading", "Stop loss & take profit", "Risk-based position sizing"],
        code: `"""
Example Strategy 1: Simple Moving Average Crossover Strategy
This strategy demonstrates basic LONG-only trading with CLOSE_ALL.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class MACrossoverStrategy(BaseStrategy):
    """
    Simple Moving Average Crossover Strategy.
    
    Entry: Fast MA crosses above Slow MA
    Exit: Fast MA crosses below Slow MA OR stop loss/take profit
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.fast_period = 10
        self.slow_period = 20
        self.price_history = []
        self.position = None
    
    def initialize(self):
        """Initialize strategy."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """Main strategy logic."""
        if not self.initialized:
            self.initialize()
        
        # Update price history
        self.price_history.append(candle.close)
        
        # Keep only last 100 prices
        if len(self.price_history) > 100:
            self.price_history.pop(0)
        
        # Calculate MAs if we have enough data
        if len(self.price_history) >= self.slow_period:
            # Calculate SMAs
            fast_ma = sum(self.price_history[-self.fast_period:]) / self.fast_period
            slow_ma = sum(self.price_history[-self.slow_period:]) / self.slow_period
            
            # Entry logic: Fast MA crosses above Slow MA
            if self.position is None and fast_ma > slow_ma:
                self.position = "LONG"
                # Calculate position size based on risk
                stop_loss_price = candle.close * 0.98  # 2% stop loss
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "BUY",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "stop_loss_pct": 0.02,  # 2% stop loss
                    "take_profit_pct": 0.05,  # 5% take profit
                    "exit_reason": "MA_CROSSOVER_ENTRY"
                }
            
            # Exit logic: Fast MA crosses below Slow MA
            if self.position == "LONG" and fast_ma < slow_ma:
                self.position = None
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "MA_CROSSOVER_EXIT"
                }
        
        return None`
    },
    {
        id: "rsi_mean_reversion",
        name: "RSI Mean Reversion",
        description: "Mean reversion strategy using RSI indicator. Trades both long and short positions based on overbought/oversold conditions.",
        difficulty: "Intermediate",
        type: "Mean Reversion",
        className: "RSIMeanReversionStrategy",
        features: ["Long & Short trading", "RSI-based signals", "Neutral zone exits"],
        code: `"""
Example Strategy 2: RSI Mean Reversion Strategy
This strategy demonstrates LONG and SHORT trading.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class RSIMeanReversionStrategy(BaseStrategy):
    """
    RSI Mean Reversion Strategy - Trades both LONG and SHORT.
    
    Entry LONG: RSI < 30 (oversold)
    Entry SHORT: RSI > 70 (overbought)
    Exit: RSI returns to neutral (40-60)
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.rsi_period = 14
        self.rsi_oversold = 30
        self.rsi_overbought = 70
        self.price_history = []
    
    def initialize(self):
        """Initialize strategy."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """Main strategy logic."""
        if not self.initialized:
            self.initialize()
        
        # Update price history
        self.price_history.append(candle.close)
        
        # Keep only last 200 prices
        if len(self.price_history) > 200:
            self.price_history.pop(0)
        
        if len(self.price_history) >= self.rsi_period + 1:
            # Calculate RSI
            rsi_values = indicators.calculate_rsi(self.price_history, self.rsi_period)
            current_rsi = rsi_values[-1]
            
            if current_rsi is None:
                return None
            
            # LONG entry: RSI oversold
            if current_rsi < self.rsi_oversold:
                stop_loss_price = candle.close * 0.97  # 3% stop loss
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "BUY",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "stop_loss_pct": 0.03,  # 3% stop loss
                    "take_profit_pct": 0.06,  # 6% take profit
                    "exit_reason": "RSI_OVERSOLD_ENTRY"
                }
            
            # SHORT entry: RSI overbought
            elif current_rsi > self.rsi_overbought:
                stop_loss_price = candle.close * 1.03  # 3% stop loss for SHORT
                quantity = self.calculate_position_size(
                    entry_price=candle.close,
                    stop_loss_price=stop_loss_price
                )
                
                return {
                    "action": "SELL",
                    "quantity": quantity,
                    "order_type": "MARKET",
                    "position_side": "SHORT",
                    "stop_loss_pct": 0.03,  # 3% stop loss
                    "take_profit_pct": 0.06,  # 6% take profit
                    "exit_reason": "RSI_OVERBOUGHT_ENTRY"
                }
            
            # Exit: RSI returns to neutral
            elif 40 <= current_rsi <= 60:
                return {
                    "action": "CLOSE_ALL",
                    "exit_reason": "RSI_NEUTRAL_EXIT"
                }
        
        return None`
    },
    {
        id: "macd_momentum",
        name: "MACD Momentum",
        description: "Advanced momentum strategy using MACD indicator with trailing stops for trend-following trades.",
        difficulty: "Advanced",
        type: "Momentum",
        className: "MACDMomentumStrategy",
        features: ["MACD crossover signals", "Trailing stops", "Momentum-based entries"],
        code: `"""
Example Strategy 3: MACD Momentum Strategy
This strategy demonstrates using MACD indicator with trailing stops.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict
from strategies import indicators


class MACDMomentumStrategy(BaseStrategy):
    """
    MACD Momentum Strategy.
    
    Entry: MACD line crosses above signal line (bullish)
    Exit: MACD line crosses below signal line OR trailing stop
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Strategy parameters
        self.fast_period = 12
        self.slow_period = 26
        self.signal_period = 9
        self.price_history = []
        self.position = None
    
    def initialize(self):
        """Initialize strategy."""
        self.initialized = True
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """Main strategy logic."""
        if not self.initialized:
            self.initialize()
        
        # Update price history
        self.price_history.append(candle.close)
        
        # Keep only last 200 prices
        if len(self.price_history) > 200:
            self.price_history.pop(0)
        
        if len(self.price_history) >= self.slow_period:
            # Calculate MACD
            macd_data = indicators.calculate_macd(
                self.price_history,
                fast=self.fast_period,
                slow=self.slow_period,
                signal=self.signal_period
            )
            
            macd_line = macd_data['macd']
            signal_line = macd_data['signal']
            
            if len(macd_line) < 2 or macd_line[-1] is None or signal_line[-1] is None:
                return None
            
            current_macd = macd_line[-1]
            current_signal = signal_line[-1]
            prev_macd = macd_line[-2] if len(macd_line) >= 2 else None
            prev_signal = signal_line[-2] if len(signal_line) >= 2 else None
            
            if prev_macd is None or prev_signal is None:
                return None
            
            # Entry: MACD crosses above signal (bullish crossover)
            if self.position is None:
                if prev_macd <= prev_signal and current_macd > current_signal:
                    self.position = "LONG"
                    stop_loss_price = candle.close * 0.95  # 5% stop loss
                    quantity = self.calculate_position_size(
                        entry_price=candle.close,
                        stop_loss_price=stop_loss_price
                    )
                    
                    return {
                        "action": "BUY",
                        "quantity": quantity,
                        "order_type": "MARKET",
                        "stop_loss_pct": 0.05,
                        "take_profit_pct": 0.10,
                        "trailing_stop": 0.03,  # 3% trailing stop
                        "exit_reason": "MACD_BULLISH_CROSSOVER"
                    }
            
            # Exit: MACD crosses below signal (bearish crossover)
            elif self.position == "LONG":
                if prev_macd >= prev_signal and current_macd < current_signal:
                    self.position = None
                    return {
                        "action": "CLOSE_ALL",
                        "exit_reason": "MACD_BEARISH_CROSSOVER"
                    }
        
        return None`
    }
];

interface StrategyTemplatesProps {
    onSelectTemplate: (template: StrategyTemplate) => void;
}

export default function StrategyTemplates({ onSelectTemplate }: StrategyTemplatesProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Beginner": return "bg-green-100 text-green-800 border-green-200";
            case "Intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Advanced": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "Trend Following": return <TrendingUp className="h-4 w-4" />;
            case "Mean Reversion": return <Activity className="h-4 w-4" />;
            case "Momentum": return <Zap className="h-4 w-4" />;
            default: return <Target className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "Trend Following": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Mean Reversion": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Momentum": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--color-primary-text)] mb-2">
                    Strategy Templates
                </h2>
                <p className="text-[var(--color-muted)]">
                    Choose from our pre-built strategies or start from scratch
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategyTemplates.map((template, index) => (
                    <Card 
                        key={template.id} 
                        className={`card-hover cursor-pointer transition-all duration-300 animate-fade-in ${
                            selectedTemplate === template.id 
                                ? 'ring-2 ring-blue-500 shadow-lg' 
                                : 'hover:shadow-md'
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => setSelectedTemplate(template.id)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(template.type)}
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                </div>
                                <Code className="h-5 w-5 text-[var(--color-muted)]" />
                            </div>
                            
                            <div className="flex gap-2 mb-3">
                                <Badge className={`text-xs px-2 py-1 ${getDifficultyColor(template.difficulty)}`}>
                                    {template.difficulty}
                                </Badge>
                                <Badge className={`text-xs px-2 py-1 ${getTypeColor(template.type)}`}>
                                    {template.type}
                                </Badge>
                            </div>
                            
                            <CardDescription className="text-sm line-clamp-3">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-medium text-[var(--color-primary-text)] mb-2">
                                        Features:
                                    </h4>
                                    <ul className="text-xs text-[var(--color-muted)] space-y-1">
                                        {template.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full"></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTemplate(template);
                                    }}
                                    className={`w-full transition-all duration-200 ${
                                        selectedTemplate === template.id
                                            ? 'btn-gradient'
                                            : ''
                                    }`}
                                    variant={selectedTemplate === template.id ? "default" : "outline"}
                                    size="sm"
                                >
                                    Use This Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Custom Strategy Option */}
                <Card className="card-hover cursor-pointer border-dashed border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-primary-text)] mb-2">
                            Start from Scratch
                        </h3>
                        <p className="text-sm text-[var(--color-muted)] mb-4">
                            Create your own custom strategy with full control over the implementation
                        </p>
                        <Button
                            onClick={() => onSelectTemplate({
                                id: "custom",
                                name: "Custom Strategy",
                                description: "Build your own trading algorithm",
                                difficulty: "Advanced",
                                type: "Custom",
                                className: "MyCustomStrategy",
                                features: ["Full customization", "Advanced features", "Complete control"],
                                code: `"""
Custom Trading Strategy Template
Build your own algorithmic trading strategy.
"""
from strategies.base import BaseStrategy
from core.candle import Candle
from typing import Optional, Dict


class MyCustomStrategy(BaseStrategy):
    """
    Your custom trading strategy.
    
    Implement your trading logic here.
    """
    
    def __init__(self, broker, config=None):
        super().__init__(broker, config)
        # Initialize your strategy parameters here
        pass
    
    def initialize(self):
        """Initialize strategy - called once before processing candles."""
        self.initialized = True
        # Set up indicators, variables, etc.
        pass
    
    def on_candle(self, candle: Candle) -> Optional[Dict]:
        """
        Main strategy logic - called for each new candle.
        
        Args:
            candle: Current candle with OHLCV data
            
        Returns:
            None: No action
            Dict: Order to place (BUY, SELL, CLOSE, CLOSE_ALL)
        """
        if not self.initialized:
            self.initialize()
        
        # Implement your trading logic here
        # Example:
        # if some_condition:
        #     return {
        #         "action": "BUY",
        #         "quantity": self.calculate_position_size(...),
        #         "order_type": "MARKET",
        #         "stop_loss_pct": 0.02,
        #         "take_profit_pct": 0.05
        #     }
        
        return None`
                            })}
                            variant="outline"
                            className="w-full"
                        >
                            Start Custom Strategy
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}