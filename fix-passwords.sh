#!/bin/bash
# Script to fix admin and demo user passwords on the server
# Usage: bash fix-passwords.sh
# Or: chmod +x fix-passwords.sh && ./fix-passwords.sh

echo "🔧 Fixing admin and demo user passwords..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || { echo "❌ Error: Cannot find backend directory"; exit 1; }

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Using default database credentials"
    echo ""
fi

# Check if node and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if bcrypt is installed
if [ ! -d "node_modules/bcrypt" ]; then
    echo "📦 Installing bcrypt..."
    npm install bcrypt mysql2 dotenv
fi

# Run the Node.js fix script
echo "🚀 Running password fix script..."
echo ""
node fix-admin-password.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script completed successfully!"
    echo ""
    echo "📝 Try logging in with:"
    echo "   Admin: admin@example.com / Admin@123"
    echo "   Demo:  demo@example.com / Demo@123"
else
    echo ""
    echo "❌ Script failed. Check the error messages above."
    exit 1
fi
