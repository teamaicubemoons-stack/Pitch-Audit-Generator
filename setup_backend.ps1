# Cubemoons Audit Generator — Backend Setup Script (Windows)
# Run: .\setup_backend.ps1

$backendPath = "$PSScriptRoot\backend"
Set-Location $backendPath

Write-Host "Creating virtual environment..." -ForegroundColor Cyan
python -m venv venv

Write-Host "Installing dependencies..." -ForegroundColor Cyan
.\venv\Scripts\pip install -r requirements.txt

Write-Host "Copying .env.example to .env..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Add your OPENAI_API_KEY to backend\.env before starting!" -ForegroundColor Yellow
}

Write-Host "`n✅ Backend setup complete!" -ForegroundColor Green
Write-Host "Run: cd backend; .\venv\Scripts\uvicorn main:app --reload --port 8000" -ForegroundColor White
