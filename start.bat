@echo off
echo ==========================================
echo Chemical Plant Digital Twin - Startup
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo Python found: 
python --version
echo Node.js found:
node --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install --silent
echo Frontend dependencies installed
echo.

REM Start backend
echo Starting backend server...
cd ..\backend
call venv\Scripts\activate.bat
start /B python app.py
echo Backend started
timeout /t 3 /nobreak >nul
echo.

REM Start frontend
echo Starting frontend development server...
cd ..\frontend
start /B npm run dev
echo Frontend started
echo.

echo ==========================================
echo System is running!
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop (you may need to close terminal windows manually)
echo.

pause
