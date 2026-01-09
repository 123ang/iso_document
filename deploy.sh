#!/bin/bash

# ISO Document Management System - Deployment Script
# For Ubuntu 20.04+ VPS
# Domain: iso.taskinsight.my

set -e

echo "🚀 ISO Document Management System - Deployment Script"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Variables
APP_DIR="/var/www/iso-document"
DOMAIN="iso.taskinsight.my"
DB_NAME="iso_document_system"
DB_USER="iso_user"

echo -e "${GREEN}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing essential tools...${NC}"
apt install -y curl wget git build-essential

echo -e "${GREEN}Step 3: Installing MySQL...${NC}"
apt install -y mysql-server

echo -e "${YELLOW}⚠️  Please set MySQL root password when prompted${NC}"
mysql_secure_installation

echo -e "${GREEN}Step 4: Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo -e "${GREEN}Step 5: Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Step 6: Installing Nginx...${NC}"
apt install -y nginx

echo -e "${GREEN}Step 7: Creating application directory...${NC}"
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

echo -e "${GREEN}Step 8: Creating storage directory...${NC}"
mkdir -p $APP_DIR/storage
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backups
chmod 755 $APP_DIR/storage

echo -e "${YELLOW}Step 9: Database Setup${NC}"
echo -e "${YELLOW}Please run these commands manually:${NC}"
echo ""
echo "mysql -u root -p"
echo "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY 'your-strong-password';"
echo "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo ""
read -p "Press Enter after completing database setup..."

echo -e "${GREEN}Step 10: Installing Certbot for SSL...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}✅ Basic server setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload your application files to: $APP_DIR"
echo "2. Configure backend/.env with database credentials"
echo "3. Configure frontend/.env.local with API URL"
echo "4. Run: cd $APP_DIR/backend && npm install && npm run build"
echo "5. Run: cd $APP_DIR/frontend && npm install && npm run build"
echo "6. Setup PM2: pm2 start ecosystem.config.js"
echo "7. Configure Nginx (see DEPLOYMENT_VPS.md)"
echo "8. Setup SSL: certbot --nginx -d $DOMAIN"
echo ""
echo -e "${GREEN}For detailed instructions, see: DEPLOYMENT_VPS.md${NC}"
