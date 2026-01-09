@echo off
echo ========================================
echo   Starting ISO Document Backend
echo ========================================
echo.

cd backend

echo Checking environment...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create it first.
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo ✅ Dependencies ready
echo.

echo Testing database connection...
node test-connection.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database connection failed!
    echo Please fix database issues first.
    pause
    exit /b 1
)

echo.
echo ✅ Database connection OK
echo.
echo ========================================
echo   Starting Backend Server...
echo ========================================
echo.
echo Backend will be available at:
echo   http://localhost:3000/api
echo.
echo API Documentation:
echo   http://localhost:3000/api/docs
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run start:dev

pause
