@echo off
echo ==========================================
echo   Starting TALI Services (Windows)
echo ==========================================
echo.

:: Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    pause
    exit /b 1
)
echo OK: Node.js found

:: Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed!
    pause
    exit /b 1
)
echo OK: Python found

:: Check PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed!
    pause
    exit /b 1
)
echo OK: PostgreSQL found

:: Check Redis
where redis-cli >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Redis CLI not found. Make sure Redis is running.
)

echo.
echo Starting services...
echo.

:: Create logs directory
if not exist "logs" mkdir logs

:: Start ML Service
echo Starting ML Service...
cd ml-service
start /B python -m uvicorn app:app --host 0.0.0.0 --port 8000 > ..\logs\ml-service.log 2>&1
cd ..
timeout /t 3 /nobreak >nul

:: Start Backend
echo Starting Backend API...
cd backend
start /B npm run dev > ..\logs\backend.log 2>&1
cd ..
timeout /t 5 /nobreak >nul

:: Start Frontend
echo Starting Frontend...
cd frontend
start /B npm run dev > ..\logs\frontend.log 2>&1
cd ..
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo   Services Started!
echo ==========================================
echo.
echo Service URLs:
echo   Frontend:   http://localhost:5173
echo   Backend:    http://localhost:3000
echo   ML Service: http://localhost:8000
echo.
echo Logs are in the 'logs' directory
echo.
echo To stop services, close this window or run stop-all.bat
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
pause
