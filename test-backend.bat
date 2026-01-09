@echo off
echo 🧪 Testing Backend Setup
echo =======================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found!
    exit /b 1
)

cd backend

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo    Create it from .env.example
    exit /b 1
)

echo ✅ Backend directory found
echo ✅ .env file found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️  node_modules not found. Installing dependencies...
    call npm install
)

echo ✅ Dependencies installed
echo.

REM Test database connection
echo Testing database connection...
node test-connection.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database connection test passed!
    echo.
    echo Starting backend server...
    call npm run start:dev
) else (
    echo.
    echo ❌ Database connection test failed!
    echo    Fix the database issues first.
    exit /b 1
)
