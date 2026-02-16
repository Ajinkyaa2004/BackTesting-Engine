# 📈 Backtesting Engine

A professional algorithmic trading backtesting platform with strategy management, broker integration, and comprehensive performance analytics.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.13+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

**New to the project?** Start here: [START_HERE.md](./START_HERE.md)

**Deploy in 5 minutes:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Strategy Development](#-strategy-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The Backtesting Engine is a full-stack web application that allows traders and quantitative analysts to develop, test, and analyze algorithmic trading strategies across multiple brokers and markets. With built-in technical indicators, customizable strategy templates, and detailed performance metrics, it provides a professional environment for strategy development and validation.

### Why Use This Platform?

- **No Coding Required**: Use pre-built strategy templates with visual configuration
- **Multi-Broker Support**: Integrate with popular brokers (Binance, Zerodha, etc.)
- **Real-Time & Historical Data**: Test strategies with both real-time and historical market data
- **Comprehensive Analytics**: Detailed performance metrics, drawdown analysis, and trade-by-trade breakdowns
- **Production-Ready**: Built with enterprise-grade technologies (FastAPI, Next.js, PostgreSQL)
- **Secure & Scalable**: JWT authentication, role-based access, and cloud-ready architecture

---

## ✨ Features

### Core Functionality

- **Strategy Management**
  - Custom Python strategy development with base classes
  - Pre-built strategy templates (MA Crossover, RSI Mean Reversion, MACD Momentum)
  - Code editor with syntax highlighting (Monaco Editor)
  - Strategy versioning and history
  - Import/export strategies

- **Backtesting Engine**
  - High-performance backtesting with event-driven architecture
  - Support for multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
  - Position management with risk controls
  - Transaction cost modeling
  - Slippage simulation

- **Broker Integration**
  - Binance integration (Spot & Futures)
  - Extensible broker framework for adding new brokers
  - API key management with encryption
  - Real-time and historical data fetching

- **Performance Analytics**
  - Total return, Sharpe ratio, Sortino ratio
  - Maximum drawdown and recovery analysis
  - Win rate, profit factor, expectancy
  - Trade distribution and holding period analysis
  - Equity curve visualization

- **User Management**
  - JWT-based authentication
  - User registration and login
  - Secure password hashing (bcrypt)
  - Protected routes and API endpoints

### UI/UX Features

- **Modern Dashboard**
  - Real-time portfolio overview
  - Recent backtests and strategies
  - Performance charts (Recharts)
  - Responsive design (Tailwind CSS)

- **Strategy Editor**
  - Monaco Editor integration
  - Syntax highlighting and autocomplete
  - Strategy validation and error checking
  - Template selection

- **Backtest Results**
  - Interactive charts and tables
  - Detailed trade logs
  - Performance metrics dashboard
  - Export results to CSV/JSON

---

## 🛠️ Tech Stack

### Backend

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.13+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose) with bcrypt
- **Async Support**: httpx, aiohttp for broker APIs
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI)

### Frontend

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.0+
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4.0
- **Components**: Radix UI primitives
- **Code Editor**: Monaco Editor
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

### DevOps & Deployment

- **Platforms**: Vercel (Frontend), Railway/Render (Backend)
- **Database**: PostgreSQL (Render/Railway)
- **Environment**: Docker-ready (optional)
- **CI/CD**: GitHub Actions (optional)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Dashboard  │  │  Strategies  │  │  Backtest Results│   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │   Auth   │  │  Strategies │  │  Backtest Engine     │   │
│  │  Module  │  │   Manager   │  │  (Event-Driven)      │   │
│  └──────────┘  └─────────────┘  └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Broker Factory & Integrations              │   │
│  │  (Binance, Zerodha, Custom Brokers)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (SQLAlchemy)                │
│  ┌──────┐  ┌────────────┐  ┌────────────┐                  │
│  │ Users│  │ Strategies │  │ Backtests  │                  │
│  └──────┘  └────────────┘  └────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **Event-Driven Backtesting**: Processes market data sequentially for realistic simulation
- **Strategy Base Class**: Extensible framework for custom strategy development
- **Broker Factory Pattern**: Unified interface for multiple broker integrations
- **Repository Pattern**: Database abstraction for clean separation of concerns
- **JWT Middleware**: Stateless authentication for API security

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### For Backend:
- **Python 3.13+** (3.11+ also supported)
- **PostgreSQL 14+** (or use cloud-hosted database)
- **pip** (Python package manager)

### For Frontend:
- **Node.js 20+** (LTS version recommended)
- **npm** or **yarn** or **pnpm**

### Optional:
- **Git** (for version control)
- **Docker** (for containerized deployment)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Backtesting_Engine-main
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/backtesting_db

# JWT Authentication
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (for development)
CORS_ORIGINS=http://localhost:3000

# Broker API Keys (optional for testing)
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
```

**Initialize Database:**

```bash
# Database tables are created automatically on first run
# Or run migrations if available
python -m alembic upgrade head
```

**Start Backend Server:**

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Backend will be available at: `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Create .env.local file
cp .env.example .env.local
```

**Configure `.env.local` file:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start Frontend Development Server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Frontend will be available at: `http://localhost:3000`

---

## 🎮 Usage

### 1. Register an Account

- Navigate to `http://localhost:3000/register`
- Create a new account with email and password
- Login with your credentials

### 2. Configure Broker Connection (Optional)

- Go to Settings or Broker Configuration
- Add your broker API credentials (e.g., Binance)
- Test connection to ensure it works

### 3. Create a Strategy

**Option A: Use a Template**
- Navigate to Strategies → New Strategy
- Select a template (MA Crossover, RSI Mean Reversion, MACD)
- Customize parameters
- Save strategy

**Option B: Write Custom Python Code**
- Navigate to Strategies → New Strategy
- Choose "Custom" template
- Write your strategy using the base class:

```python
from strategies.base import BaseStrategy

class MyStrategy(BaseStrategy):
    def __init__(self):
        super().__init__()
        self.name = "My Custom Strategy"
        
    def should_enter(self, candles):
        # Your entry logic here
        return True  # or False
        
    def should_exit(self, candles, position):
        # Your exit logic here
        return True  # or False
```

See [STRATEGY_FORMAT_GUIDE.md](./backend/STRATEGY_FORMAT_GUIDE.md) for details.

### 4. Run a Backtest

- Navigate to your saved strategy
- Click "Run Backtest"
- Configure parameters:
  - Symbol (e.g., BTC/USDT)
  - Timeframe (1m, 5m, 1h, 1d)
  - Date range
  - Initial capital
  - Position size
- Click "Start Backtest"
- View results in real-time

### 5. Analyze Results

- View performance metrics dashboard
- Analyze equity curve
- Review trade-by-trade breakdown
- Export results for further analysis
- Compare multiple backtests

---

## 📂 Project Structure

```
Backtesting_Engine-main/
├── backend/                      # FastAPI backend
│   ├── main.py                   # Application entry point
│   ├── requirements.txt          # Python dependencies
│   ├── api/                      # API route handlers
│   │   ├── health.py            # Health check endpoints
│   │   ├── brokers.py           # Broker-related endpoints
│   │   └── strategies.py        # Strategy CRUD endpoints
│   ├── auth/                     # Authentication module
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── jwt.py               # JWT token handling
│   │   ├── password.py          # Password hashing
│   │   ├── routes.py            # Auth routes (login/register)
│   │   └── schemas.py           # Auth schemas
│   ├── brokers/                  # Broker integrations
│   │   ├── base.py              # Base broker interface
│   │   ├── binance.py           # Binance implementation
│   │   └── factory.py           # Broker factory
│   ├── core/                     # Core domain models
│   │   └── candle.py            # Candle data structure
│   ├── db/                       # Database configuration
│   │   └── database.py          # SQLAlchemy setup
│   ├── engine/                   # Backtesting engine
│   │   ├── backtest.py          # Main backtest runner
│   │   └── position.py          # Position management
│   ├── models/                   # SQLAlchemy models
│   │   ├── user.py              # User model
│   │   ├── strategy.py          # Strategy model
│   │   └── backtest.py          # Backtest model
│   ├── strategies/               # Strategy framework
│   │   ├── base.py              # Base strategy class
│   │   ├── indicators.py        # Technical indicators
│   │   ├── loader.py            # Dynamic strategy loader
│   │   └── schemas.py           # Strategy schemas
│   └── examples/                 # Example strategies
│       └── strategies/
│           ├── ma_crossover.py
│           ├── rsi_mean_reversion.py
│           └── macd_momentum.py
│
├── frontend/                     # Next.js frontend
│   ├── package.json             # Node dependencies
│   ├── next.config.ts           # Next.js configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Register page
│   │   └── (dashboard)/         # Dashboard route group
│   │       ├── dashboard/       # Main dashboard
│   │       ├── strategies/      # Strategy management
│   │       └── backtests/       # Backtest results
│   ├── components/              # React components
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # UI components (buttons, cards, etc.)
│   └── lib/                     # Utilities and configs
│       ├── api.ts               # API client
│       ├── config.ts            # App configuration
│       └── types.ts             # TypeScript types
│
├── DEPLOYMENT_GUIDE.md          # Comprehensive deployment guide
├── QUICK_DEPLOY.md              # Quick deployment (Railway)
├── QUICK_DEPLOY_RENDER.md       # Quick deployment (Render)
├── START_HERE.md                # Getting started guide
└── README.md                    # This file
```

---

## 📚 API Documentation

### Interactive API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
```
POST /auth/register          # Register new user
POST /auth/login            # Login and get JWT token
GET  /auth/me               # Get current user info
```

#### Strategies
```
GET    /api/strategies               # List all strategies
POST   /api/strategies               # Create new strategy
GET    /api/strategies/{id}          # Get strategy by ID
PUT    /api/strategies/{id}          # Update strategy
DELETE /api/strategies/{id}          # Delete strategy
POST   /api/strategies/{id}/backtest # Run backtest
```

#### Brokers
```
GET  /api/brokers                    # List available brokers
POST /api/brokers/connect            # Connect broker API
GET  /api/brokers/candles            # Fetch historical data
```

#### Health
```
GET  /health                         # Health check
GET  /health/db                      # Database health
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Strategy Development

### Strategy Template Structure

```python
from strategies.base import BaseStrategy
from strategies.indicators import sma, rsi, macd

class MyCustomStrategy(BaseStrategy):
    """
    My custom trading strategy description
    """
    
    def __init__(self, param1=20, param2=50):
        super().__init__()
        self.name = "My Custom Strategy"
        self.param1 = param1
        self.param2 = param2
        
    def should_enter(self, candles):
        """
        Entry logic - return True to open position
        
        Args:
            candles: List of Candle objects (OHLCV data)
            
        Returns:
            bool: True if entry condition is met
        """
        if len(candles) < self.param2:
            return False
            
        # Calculate indicators
        sma_short = sma(candles, self.param1)
        sma_long = sma(candles, self.param2)
        
        # Entry condition: short SMA crosses above long SMA
        return sma_short[-1] > sma_long[-1] and sma_short[-2] <= sma_long[-2]
        
    def should_exit(self, candles, position):
        """
        Exit logic - return True to close position
        
        Args:
            candles: List of Candle objects
            position: Current position object
            
        Returns:
            bool: True if exit condition is met
        """
        if len(candles) < self.param2:
            return False
            
        # Calculate indicators
        sma_short = sma(candles, self.param1)
        sma_long = sma(candles, self.param2)
        
        # Exit condition: short SMA crosses below long SMA
        return sma_short[-1] < sma_long[-1] and sma_short[-2] >= sma_long[-2]
```

### Available Indicators

The platform provides common technical indicators:

- **Moving Averages**: `sma()`, `ema()`
- **Momentum**: `rsi()`, `macd()`, `stochastic()`
- **Volatility**: `bollinger_bands()`, `atr()`
- **Volume**: `obv()`, `volume_sma()`

See [STRATEGY_FORMAT_GUIDE.md](./backend/STRATEGY_FORMAT_GUIDE.md) for complete documentation.

---

## 🚀 Deployment

### Quick Deployment Options

1. **Vercel + Railway** (Recommended - 5 minutes)
   - [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

2. **Vercel + Render** (Popular - 10 minutes)
   - [QUICK_DEPLOY_RENDER.md](./QUICK_DEPLOY_RENDER.md)

3. **Both on Render**
   - [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

### Deployment Checklist

Before deploying, review:
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Environment Variables

**Backend:**
```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://your-frontend-domain.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_backtest.py
```

### Frontend Tests

```bash
cd frontend

# Run tests (if configured)
npm test

# Run linting
npm run lint
```

### Integration Tests

See [INTEGRATION_TEST.md](./INTEGRATION_TEST.md) for end-to-end testing guide.

### Postman Collection

Import [backend/POSTMAN_COLLECTION.json](./backend/POSTMAN_COLLECTION.json) to test API endpoints.

---

## 📖 Documentation

- **[START_HERE.md](./START_HERE.md)** - Quick start guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[BACKTESTING_EXPLANATION.md](./BACKTESTING_EXPLANATION.md)** - How backtesting works
- **[STRATEGY_FORMAT_GUIDE.md](./backend/STRATEGY_FORMAT_GUIDE.md)** - Strategy development guide
- **[STRATEGY_QUICK_REFERENCE.md](./backend/STRATEGY_QUICK_REFERENCE.md)** - Quick reference
- **[POSTMAN_TESTING_GUIDE.md](./backend/POSTMAN_TESTING_GUIDE.md)** - API testing guide
- **[PLATFORM_COMPARISON.md](./PLATFORM_COMPARISON.md)** - Deployment platform comparison
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Solution: Check DATABASE_URL in .env file
Ensure PostgreSQL is running
```

**2. CORS Error in Frontend**
```
Solution: Add frontend URL to CORS_ORIGINS in backend .env
```

**3. JWT Token Invalid**
```
Solution: Ensure SECRET_KEY matches between login and verification
Check token expiration time
```

**4. Strategy Import Error**
```
Solution: Verify strategy code syntax
Check all imports are available
Ensure BaseStrategy is inherited
```

For more issues, check existing GitHub issues or create a new one.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **Recharts** - Charting library for React
- **Monaco Editor** - Code editor by Microsoft
- **Radix UI** - Unstyled, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework

---

## 📧 Support

For questions and support:

- 📖 Check the [documentation files](./START_HERE.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Discussions via GitHub Discussions
- 📧 Email: support@example.com (update with your contact)

---

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Quantitative Trading Basics](https://www.investopedia.com/algorithmic-trading-4427730)
- [Technical Analysis](https://www.investopedia.com/terms/t/technicalanalysis.asp)

---

**Made with ❤️ for algorithmic traders and quantitative analysts**

---

*Last Updated: February 2026*
