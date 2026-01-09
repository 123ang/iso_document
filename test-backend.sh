#!/bin/bash

echo "🧪 Testing Backend Setup"
echo "======================="
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Create it from .env.example"
    exit 1
fi

echo "✅ Backend directory found"
echo "✅ .env file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"
echo ""

# Test database connection
echo "Testing database connection..."
node test-connection.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database connection test passed!"
    echo ""
    echo "Starting backend server..."
    npm run start:dev
else
    echo ""
    echo "❌ Database connection test failed!"
    echo "   Fix the database issues first."
    exit 1
fi
