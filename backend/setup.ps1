# Setup script for Windows PowerShell
# Creates virtual environment and installs dependencies

Write-Host "Setting up Python virtual environment..." -ForegroundColor Green

# Check if venv exists and is valid
$recreateVenv = $false
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Checking if it's valid..." -ForegroundColor Yellow
    
    # Check if Python executable exists in venv
    $venvPython = ".\venv\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
        Write-Host "Virtual environment Python executable not found. Will recreate..." -ForegroundColor Yellow
        $recreateVenv = $true
    } else {
        # Try to run Python to verify it works
        try {
            $pythonVersion = & $venvPython --version 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Python check failed"
            }
            Write-Host "Virtual environment is valid (Python: $pythonVersion)" -ForegroundColor Green
        } catch {
            Write-Host "Virtual environment appears corrupted. Will recreate..." -ForegroundColor Yellow
            $recreateVenv = $true
        }
    }
    
    if ($recreateVenv) {
        Write-Host "Removing old virtual environment..." -ForegroundColor Yellow
        # Deactivate if currently active
        if ($env:VIRTUAL_ENV) {
            deactivate 2>$null
        }
        # Try to remove, ignore errors for locked files
        Remove-Item -Recurse -Force "venv" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        # If still exists, try again after a longer wait
        if (Test-Path "venv") {
            Write-Host "Waiting for file locks to release..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            Remove-Item -Recurse -Force "venv" -ErrorAction SilentlyContinue
        }
    }
}

# Create virtual environment if needed
if (-not (Test-Path "venv") -or $recreateVenv) {
    Write-Host "Creating virtual environment..." -ForegroundColor Green
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create virtual environment!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created successfully." -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& .\venv\Scripts\Activate.ps1

# Verify activation
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Warning: Virtual environment may not have activated properly." -ForegroundColor Yellow
}

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: pip upgrade failed, but continuing..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup complete! To start the server, run:" -ForegroundColor Green
Write-Host "  .\run.ps1" -ForegroundColor Cyan
Write-Host "  OR" -ForegroundColor Cyan
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
Write-Host "  uvicorn main:app --reload" -ForegroundColor Cyan
