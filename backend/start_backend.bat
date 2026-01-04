@echo off
echo Starting IPPL4Y Backend Server...
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create a .env file in the backend directory with the following variables:
    echo   MONGO_URL=mongodb://localhost:27017
    echo   DB_NAME=ippl4y
    echo   CORS_ORIGINS=http://localhost:3000
    echo.
    echo You can copy .env.example to .env and modify it:
    echo   copy .env.example .env
    echo.
    pause
    exit /b 1
)

REM Start the backend server
echo Starting server on http://localhost:8000
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

pause



