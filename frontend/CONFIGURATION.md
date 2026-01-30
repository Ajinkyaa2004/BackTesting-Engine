# Frontend Configuration Guide

## Environment Variables

The frontend uses environment variables to avoid hardcoded values. All configuration is centralized and easily customizable.

### Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your specific values:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Default Trading Configuration
NEXT_PUBLIC_DEFAULT_BROKER=binance
NEXT_PUBLIC_DEFAULT_SYMBOL=BTCUSDT
NEXT_PUBLIC_DEFAULT_INTERVAL=1h
NEXT_PUBLIC_DEFAULT_INITIAL_CAPITAL=10000
NEXT_PUBLIC_DEFAULT_RISK_PER_TRADE=2.0
NEXT_PUBLIC_DEFAULT_MAX_POSITIONS=1
NEXT_PUBLIC_DEFAULT_LIMIT=1000
```

### Configuration Options

#### API Configuration
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
  - Development: `http://localhost:8000`
  - Production: `https://your-api-domain.com`

#### Trading Defaults
- `NEXT_PUBLIC_DEFAULT_BROKER`: Default broker selection
- `NEXT_PUBLIC_DEFAULT_SYMBOL`: Default trading pair
- `NEXT_PUBLIC_DEFAULT_INTERVAL`: Default timeframe
- `NEXT_PUBLIC_DEFAULT_INITIAL_CAPITAL`: Default starting capital
- `NEXT_PUBLIC_DEFAULT_RISK_PER_TRADE`: Default risk percentage
- `NEXT_PUBLIC_DEFAULT_MAX_POSITIONS`: Default max concurrent positions
- `NEXT_PUBLIC_DEFAULT_LIMIT`: Default max candles to fetch

### Centralized Configuration

All configuration is managed through `lib/config.ts`:

```typescript
import config from '@/lib/config';

// Access default values
const defaultBroker = config.defaults.broker;
const apiUrl = config.apiUrl;

// Access validation rules
const minCapital = config.validation.minInitialCapital;
```

### Benefits

✅ **No Hardcoded Values**: All values are configurable
✅ **Environment-Specific**: Different configs for dev/prod
✅ **Type-Safe**: TypeScript configuration with validation
✅ **Centralized**: Single source of truth for all settings
✅ **Flexible**: Easy to modify without code changes

### Production Deployment

For production, set environment variables in your hosting platform:

- **Vercel**: Add variables in project settings
- **Netlify**: Add variables in site settings
- **Docker**: Use environment files or container variables

### Validation

The configuration includes validation rules to prevent invalid values:

- Initial Capital: $100 - $1,000,000
- Risk per Trade: 0.1% - 10%
- Max Candles: 100 - 5,000

These ensure the application remains stable and prevents user errors.