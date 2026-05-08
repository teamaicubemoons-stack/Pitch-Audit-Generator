# Cubemoons Audit Generator — Quick Start Script (Windows PowerShell)
# Run this from the project root: .\start.ps1

Write-Host "`n🚀 Starting Cubemoons Audit Generator..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkGray

# ─── Backend ────────────────────────────────────────────────────────────────
$backendPath = "$PSScriptRoot\backend"

# Create venv if it doesn't exist
if (-not (Test-Path "$backendPath\venv")) {
    Write-Host "`n📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$backendPath\venv"
}

# Install requirements
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
& "$backendPath\venv\Scripts\pip.exe" install -r "$backendPath\requirements.txt" --quiet

# Check for .env file
if (-not (Test-Path "$backendPath\.env")) {
    Write-Host "`n⚠️  No .env file found in backend/. Copying .env.example..." -ForegroundColor Red
    Copy-Item "$backendPath\.env.example" "$backendPath\.env"
    Write-Host "   ➡  Please edit backend\.env and add your OPENAI_API_KEY, then re-run this script." -ForegroundColor Yellow
    exit 1
}

# Start backend in background
Write-Host "`n✅ Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    & ".\venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8000
} -ArgumentList $backendPath

# Give backend time to boot
Start-Sleep -Seconds 3

# ─── Frontend ───────────────────────────────────────────────────────────────
$frontendPath = "$PSScriptRoot\frontend"

Write-Host "`n✅ Starting React frontend on http://localhost:3000 ..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

Write-Host "`n============================================" -ForegroundColor DarkGray
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚙️  Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 API Docs:  http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host "`nPress Ctrl+C to stop all services.`n" -ForegroundColor Gray

# Stream output
try {
    while ($true) {
        $backendJob | Receive-Job | Write-Host -ForegroundColor DarkGray
        $frontendJob | Receive-Job | Write-Host -ForegroundColor DarkCyan
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "`n🛑 Stopping all services..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
