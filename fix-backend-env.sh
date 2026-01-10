#!/bin/bash
# Script to fix backend .env file on server
# Run this on your VPS: bash fix-backend-env.sh

echo "🔧 Fixing backend .env file..."
echo ""

BACKEND_DIR="/root/projects/iso_document/backend"
ENV_FILE="$BACKEND_DIR/.env"

# Navigate to backend directory
cd "$BACKEND_DIR" || { echo "❌ Error: Cannot find backend directory"; exit 1; }

echo "📁 Backend directory: $BACKEND_DIR"
echo ""

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
    echo "📄 .env file exists. Checking contents..."
    echo ""
    echo "Current database config:"
    grep "DB_" "$ENV_FILE" 2>/dev/null || echo "  No DB_ variables found"
    echo ""
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up existing .env file"
    echo ""
fi

# Create/update .env file with correct database credentials
echo "🔨 Creating/updating .env file with database credentials..."
echo ""

cat > "$ENV_FILE" << 'EOF'
NODE_ENV=production
PORT=4007
API_PREFIX=api

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=iso_user
DB_PASSWORD=5792_Ang
DB_DATABASE=iso_document_system

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters-long
JWT_EXPIRES_IN=24h

STORAGE_PATH=/root/projects/iso_document/storage
MAX_FILE_SIZE=1073741824

CORS_ORIGIN=https://iso.taskinsight.my

ENABLE_AUDIT_LOG=true
EOF

# Generate JWT secret
echo "🔐 Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null)

if [ -n "$JWT_SECRET" ]; then
    # Replace JWT_SECRET in .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$ENV_FILE"
    echo "✅ JWT secret generated and updated"
else
    echo "⚠️  Could not generate JWT secret automatically"
    echo "   Please edit .env file and set a strong JWT_SECRET manually"
fi

echo ""
echo "✅ .env file created/updated successfully!"
echo ""
echo "📋 Database Configuration:"
echo "   DB_HOST: localhost"
echo "   DB_PORT: 3306"
echo "   DB_USERNAME: iso_user"
echo "   DB_PASSWORD: 5792_Ang"
echo "   DB_DATABASE: iso_document_system"
echo ""

# Verify database connection
echo "🔍 Verifying database connection..."
if mysql -u iso_user -p5792_Ang -h localhost -e "USE iso_document_system;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed!"
    echo ""
    echo "💡 Please verify:"
    echo "   1. MySQL is running: sudo systemctl status mysql"
    echo "   2. Database exists: mysql -u root -p -e 'SHOW DATABASES LIKE \"iso_document_system\";'"
    echo "   3. User exists: mysql -u root -p -e \"SELECT user FROM mysql.user WHERE user='iso_user';\""
    echo ""
    echo "   If user doesn't exist, create it:"
    echo "   sudo mysql -u root -p"
    echo "   CREATE USER 'iso_user'@'localhost' IDENTIFIED BY '5792_Ang';"
    echo "   GRANT ALL PRIVILEGES ON iso_document_system.* TO 'iso_user'@'localhost';"
    echo "   FLUSH PRIVILEGES;"
    echo "   EXIT;"
fi

echo ""
echo "🔄 Now restart the backend:"
echo "   pm2 restart iso-backend"
echo "   pm2 logs iso-backend --lines 30"
echo ""
