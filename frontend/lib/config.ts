// Application Configuration
export const config = {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    
    // Default Trading Parameters
    defaults: {
        broker: process.env.NEXT_PUBLIC_DEFAULT_BROKER || "binance",
        symbol: process.env.NEXT_PUBLIC_DEFAULT_SYMBOL || "BTCUSDT",
        interval: process.env.NEXT_PUBLIC_DEFAULT_INTERVAL || "1h",
        initialCapital: parseInt(process.env.NEXT_PUBLIC_DEFAULT_INITIAL_CAPITAL || "10000"),
        riskPerTrade: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_RISK_PER_TRADE || "2.0"),
        maxPositions: parseInt(process.env.NEXT_PUBLIC_DEFAULT_MAX_POSITIONS || "1"),
        limit: parseInt(process.env.NEXT_PUBLIC_DEFAULT_LIMIT || "1000"),
    },
    
    // UI Configuration
    ui: {
        animationDuration: 300,
        chartHeight: 400,
        tablePageSize: 10,
    },
    
    // Trading Intervals
    intervals: [
        { value: "1m", label: "1 Minute" },
        { value: "5m", label: "5 Minutes" },
        { value: "15m", label: "15 Minutes" },
        { value: "30m", label: "30 Minutes" },
        { value: "1h", label: "1 Hour" },
        { value: "4h", label: "4 Hours" },
        { value: "1d", label: "1 Day" },
        { value: "1w", label: "1 Week" }
    ],
    
    // Popular Trading Symbols
    popularSymbols: [
        "BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT", "LINKUSDT",
        "BNBUSDT", "SOLUSDT", "MATICUSDT", "AVAXUSDT", "ATOMUSDT"
    ],
    
    // Validation Rules
    validation: {
        minInitialCapital: 100,
        maxInitialCapital: 1000000,
        minRiskPerTrade: 0.1,
        maxRiskPerTrade: 10,
        minLimit: 100,
        maxLimit: 5000,
    }
};

export default config;