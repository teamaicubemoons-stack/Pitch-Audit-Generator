@echo off
echo.
echo  ========================================
echo   CUBEMOONS AUDIT GENERATOR - STARTING
echo  ========================================
echo.

:: Backend window
start "Cubemoons Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\uvicorn main:app --reload --port 8000"

:: Small delay so backend starts first
timeout /t 2 /nobreak > nul

:: Frontend window
start "Cubemoons Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Backend:   http://localhost:8000
echo  Frontend:  http://localhost:3000
echo  API Docs:  http://localhost:8000/api/docs
echo.
echo  Dono servers start ho rahe hain...
echo  (Yeh window band kar sakte ho)
echo.
pause
