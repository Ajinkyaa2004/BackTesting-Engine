# Algo Trading Backend

Modular algo-trading backend built with FastAPI.

## Architecture

```
backend/
 ├ main.py              # FastAPI app entry point
 ├ api/                 # API routes
 ├ auth/                # Authentication & JWT
 ├ brokers/             # Broker abstraction layer
 ├ core/                # Core utilities
 ├ engine/              # Backtesting engine
 ├ strategies/          # Strategy plugin system
 ├ models/              # SQLAlchemy models
 └ db/                  # Database configuration
```

## Setup

### Windows PowerShell (Recommended)

1. Run the setup script:
```powershell
.\setup.ps1
```

2. Start the server:
```powershell
.\run.ps1
```

### Manual Setup

1. Create virtual environment:
```powershell
python -m venv venv
```

2. Activate virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. (Optional) Create `.env` file from `.env.example`:
```powershell
Copy-Item .env.example .env
```

5. Run the server:
```powershell
uvicorn main:app --reload
```

### Linux/Mac

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Phase 1
- `GET /` - Root endpoint
- `GET /health` - Health check

## Development

- Database: SQLite (default) or PostgreSQL
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
