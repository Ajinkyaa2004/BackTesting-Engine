"""
Common technical indicators library for strategies.
Provides standardized indicator calculations.
"""
from typing import List, Dict
import math


def calculate_sma(prices: List[float], period: int) -> List[float]:
    """
    Calculate Simple Moving Average (SMA).
    
    Args:
        prices: List of price values
        period: Period for moving average
        
    Returns:
        List of SMA values (same length as prices, None for insufficient data)
    """
    if len(prices) < period:
        return [None] * len(prices)
    
    sma_values = []
    for i in range(len(prices)):
        if i < period - 1:
            sma_values.append(None)
        else:
            sma = sum(prices[i - period + 1:i + 1]) / period
            sma_values.append(sma)
    
    return sma_values


def calculate_ema(prices: List[float], period: int) -> List[float]:
    """
    Calculate Exponential Moving Average (EMA).
    
    Args:
        prices: List of price values
        period: Period for EMA
        
    Returns:
        List of EMA values (same length as prices, None for insufficient data)
    """
    if len(prices) < period:
        return [None] * len(prices)
    
    multiplier = 2 / (period + 1)
    ema_values = []
    
    # First EMA value is SMA
    first_sma = sum(prices[:period]) / period
    ema_values.extend([None] * (period - 1))
    ema_values.append(first_sma)
    
    # Calculate subsequent EMA values
    for i in range(period, len(prices)):
        ema = (prices[i] - ema_values[-1]) * multiplier + ema_values[-1]
        ema_values.append(ema)
    
    return ema_values


def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
    """
    Calculate Relative Strength Index (RSI).
    
    Args:
        prices: List of price values
        period: Period for RSI calculation (default: 14)
        
    Returns:
        List of RSI values (0-100, None for insufficient data)
    """
    if len(prices) < period + 1:
        return [None] * len(prices)
    
    rsi_values = [None] * period
    
    # Calculate price changes
    changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    
    # Calculate RSI for each period
    for i in range(period, len(changes) + 1):
        period_changes = changes[i - period:i]
        gains = [c for c in period_changes if c > 0]
        losses = [-c for c in period_changes if c < 0]
        
        avg_gain = sum(gains) / period if gains else 0
        avg_loss = sum(losses) / period if losses else 0
        
        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
        
        rsi_values.append(rsi)
    
    return rsi_values


def calculate_macd(
    prices: List[float],
    fast: int = 12,
    slow: int = 26,
    signal: int = 9
) -> Dict[str, List[float]]:
    """
    Calculate MACD (Moving Average Convergence Divergence).
    
    Args:
        prices: List of price values
        fast: Fast EMA period (default: 12)
        slow: Slow EMA period (default: 26)
        signal: Signal line EMA period (default: 9)
        
    Returns:
        Dictionary with keys: 'macd', 'signal', 'histogram'
    """
    if len(prices) < slow:
        return {
            'macd': [None] * len(prices),
            'signal': [None] * len(prices),
            'histogram': [None] * len(prices)
        }
    
    # Calculate fast and slow EMAs
    fast_ema = calculate_ema(prices, fast)
    slow_ema = calculate_ema(prices, slow)
    
    # Calculate MACD line
    macd_line = []
    for i in range(len(prices)):
        if fast_ema[i] is None or slow_ema[i] is None:
            macd_line.append(None)
        else:
            macd_line.append(fast_ema[i] - slow_ema[i])
    
    # Calculate signal line (EMA of MACD)
    signal_line = calculate_ema([m for m in macd_line if m is not None], signal)
    
    # Pad signal line with None values
    signal_padded = [None] * (len(macd_line) - len(signal_line)) + signal_line
    
    # Calculate histogram
    histogram = []
    for i in range(len(macd_line)):
        if macd_line[i] is None or signal_padded[i] is None:
            histogram.append(None)
        else:
            histogram.append(macd_line[i] - signal_padded[i])
    
    return {
        'macd': macd_line,
        'signal': signal_padded,
        'histogram': histogram
    }


def calculate_bollinger_bands(
    prices: List[float],
    period: int = 20,
    std_dev: int = 2
) -> Dict[str, List[float]]:
    """
    Calculate Bollinger Bands.
    
    Args:
        prices: List of price values
        period: Period for moving average (default: 20)
        std_dev: Standard deviation multiplier (default: 2)
        
    Returns:
        Dictionary with keys: 'upper', 'middle', 'lower'
    """
    if len(prices) < period:
        return {
            'upper': [None] * len(prices),
            'middle': [None] * len(prices),
            'lower': [None] * len(prices)
        }
    
    sma = calculate_sma(prices, period)
    upper = []
    lower = []
    
    for i in range(len(prices)):
        if sma[i] is None:
            upper.append(None)
            lower.append(None)
        else:
            # Calculate standard deviation
            period_prices = prices[i - period + 1:i + 1]
            mean = sma[i]
            variance = sum((p - mean) ** 2 for p in period_prices) / period
            std = math.sqrt(variance)
            
            upper.append(mean + (std_dev * std))
            lower.append(mean - (std_dev * std))
    
    return {
        'upper': upper,
        'middle': sma,
        'lower': lower
    }


def calculate_atr(
    highs: List[float],
    lows: List[float],
    closes: List[float],
    period: int = 14
) -> List[float]:
    """
    Calculate Average True Range (ATR).
    
    Args:
        highs: List of high prices
        lows: List of low prices
        closes: List of close prices
        period: Period for ATR calculation (default: 14)
        
    Returns:
        List of ATR values
    """
    if len(highs) < period + 1 or len(lows) < period + 1 or len(closes) < period + 1:
        return [None] * len(highs)
    
    # Calculate True Range
    true_ranges = []
    for i in range(1, len(highs)):
        tr1 = highs[i] - lows[i]
        tr2 = abs(highs[i] - closes[i - 1])
        tr3 = abs(lows[i] - closes[i - 1])
        true_ranges.append(max(tr1, tr2, tr3))
    
    # Calculate ATR (SMA of True Range)
    atr_values = [None] * period
    
    for i in range(period - 1, len(true_ranges)):
        atr = sum(true_ranges[i - period + 1:i + 1]) / period
        atr_values.append(atr)
    
    return atr_values

def calculate_supertrend(
    highs: List[float],
    lows: List[float],
    closes: List[float],
    period: int = 7,
    multiplier: float = 3.0
) -> List[float]:
    """
    Calculate Supertrend indicator.
    
    Args:
        highs: List of high prices
        lows: List of low prices
        closes: List of close prices
        period: ATR period (default: 7)
        multiplier: ATR multiplier (default: 3.0)
        
    Returns:
        List of Supertrend values
    """
    if len(highs) < period + 1:
        return [None] * len(highs)
    
    # Calculate ATR
    atr_values = calculate_atr(highs, lows, closes, period)
    
    # Initialize Supertrend list
    supertrend = [None] * period
    
    # Calculate basic bands
    basic_upper = []
    basic_lower = []
    final_upper = []
    final_lower = []
    
    for i in range(period, len(highs)):
        hl_avg = (highs[i] + lows[i]) / 2
        if atr_values[i] is not None:
            basic_upper.append(hl_avg + (multiplier * atr_values[i]))
            basic_lower.append(hl_avg - (multiplier * atr_values[i]))
        else:
            basic_upper.append(None)
            basic_lower.append(None)
    
    # Calculate final bands
    for i in range(len(basic_upper)):
        if basic_upper[i] is None:
            final_upper.append(None)
            final_lower.append(None)
            continue
            
        if i == 0:
            final_upper.append(basic_upper[i])
            final_lower.append(basic_lower[i])
        else:
            prev_close = closes[period + i - 1]
            if prev_close <= final_upper[i-1]:
                final_upper.append(min(basic_upper[i], final_upper[i-1]))
            else:
                final_upper.append(basic_upper[i])
            
            if prev_close >= final_lower[i-1]:
                final_lower.append(max(basic_lower[i], final_lower[i-1]))
            else:
                final_lower.append(basic_lower[i])
    
    # Calculate Supertrend
    st_direction = None
    for i in range(len(final_upper)):
        if final_upper[i] is None or final_lower[i] is None:
            supertrend.append(None)
            continue
            
        current_close = closes[period + i]
        prev_close = closes[period + i - 1] if i > 0 else closes[period + i]
        
        # Determine initial direction
        if st_direction is None:
            if current_close <= final_upper[i]:
                st_direction = "down"
                st_value = final_upper[i]
            else:
                st_direction = "up"
                st_value = final_lower[i]
        else:
            # Update direction based on price crossing
            if st_direction == "down":
                if current_close > final_upper[i]:
                    st_direction = "up"
                    st_value = final_lower[i]
                else:
                    st_value = final_upper[i]
            else:  # up
                if current_close < final_lower[i]:
                    st_direction = "down"
                    st_value = final_upper[i]
                else:
                    st_value = final_lower[i]
        
        supertrend.append(st_value)
    
    return supertrend
