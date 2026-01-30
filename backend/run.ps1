# Quick run script for Windows PowerShell
# Activates venv and starts the server

Write-Host "Starting Algo Trading Backend..." -ForegroundColor Green

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Virtual environment not found. Please run setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Start server
Write-Host "Starting server on http://localhost:8000" -ForegroundColor Green
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 --log-level info
