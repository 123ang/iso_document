# 🚀 VPS Deployment Guide - iso.taskinsight.my

Complete guide for deploying the ISO Document Management System on a VPS server.

---

## 📋 Prerequisites

- **VPS Server** (Ubuntu 20.04+ recommended)
- **Domain:** iso.taskinsight.my (pointed to your VPS IP)
- **SSH Access** to your VPS
- **Root or sudo access**

## 🚀 Quick Start (Files Already at /root/projects/iso_document)

If you've already pulled your files to `/root/projects/iso_document`, you can skip Step 5 and jump directly to:
- **Step 6:** Configure Backend (create `.env` file)
- **Step 7:** Configure Frontend (create `.env` file)
- **Step 8:** Setup PM2

**Important:** Make sure you've already imported the database schema (Step 2.4) which now uses `access_groups` instead of the reserved keyword `groups`.

---

## 🛠️ Step 1: Server Initial Setup

### 1.1 Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### 1.2 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Essential Tools

```bash
sudo apt install -y curl wget git build-essential
```

---

## 🗄️ Step 2: Install MySQL

### 2.1 Install MySQL Server

```bash
sudo apt install -y mysql-server
```

### 2.2 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

**Follow prompts:**
- Set root password: **Yes** (choose a strong password)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes** (unless needed)
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 2.3 Create Database and User

```bash
sudo mysql -u root -p
```

**In MySQL prompt:**

```sql
CREATE DATABASE iso_document_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iso_user'@'localhost' IDENTIFIED BY '5792_Ang';
GRANT ALL PRIVILEGES ON iso_document_system.* TO 'iso_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.4 Import Database Schema

```bash
# Navigate to the database directory
cd /root/projects/iso_document/database

# Import schema (uses 'access_groups' table instead of reserved keyword 'groups')
mysql -u iso_user -p iso_document_system < schema.sql

# Import seed data (includes admin@example.com and demo@example.com users)
mysql -u iso_user -p iso_document_system < seed.sql
```

**Note:** The schema uses `access_groups` table name to avoid MySQL reserved keyword conflicts. All code has been updated to use this table name automatically via TypeORM.

---

## 📦 Step 3: Install Node.js

### 3.1 Install Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3.2 Verify Installation

```bash
node --version  # Should show v18.x or higher
npm --version
```

### 3.3 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 🌐 Step 4: Install Nginx

### 4.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 4.2 Start and Enable Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📁 Step 5: Deploy Application Files

### 5.1 Create Application Directory

```bash
mkdir -p /root/projects/iso_document
cd /root/projects/iso_document
```

**Note:** If you've already pulled your files here via Git/SCP, skip to Step 5.3.

### 5.2 Upload Your Project

**Option A: Using Git (Recommended)**

```bash
cd /root/projects
git clone <your-repo-url> iso_document
# or if you already cloned, navigate to it
cd iso_document
```

**Option B: Using SCP (from your local machine)**

```bash
# From your local machine
scp -r iso_document/* root@your-vps-ip:/root/projects/iso_document/
```

### 5.3 Set Permissions

```bash
cd /root/projects/iso_document
chmod -R 755 .
```

---

## ⚙️ Step 6: Configure Backend

### 6.1 Install Backend Dependencies

```bash
cd /root/projects/iso_document/backend
# Install ALL dependencies (including dev dependencies needed for building)
npm install
```

### 6.2 Create Production .env File

```bash
cd /root/projects/iso_document/backend
nano .env
```

**Paste this configuration:**

```env
# Application Configuration
NODE_ENV=production
PORT=4007
API_PREFIX=api

# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=iso_user
DB_PASSWORD=your-strong-password-here
DB_DATABASE=iso_document_system

# JWT Configuration
# IMPORTANT: Generate a strong random secret!
JWT_SECRET=generate-a-very-long-random-string-here-minimum-32-characters
JWT_EXPIRES_IN=24h

# File Storage Configuration
STORAGE_PATH=/root/projects/iso_document/storage
MAX_FILE_SIZE=1073741824

# CORS Configuration
CORS_ORIGIN=https://iso.taskinsight.my

# Audit Logging
ENABLE_AUDIT_LOG=true
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.3 Build Backend

```bash
cd /root/projects/iso_document/backend
npm run build
```

### 6.4 Create Storage Directory

```bash
mkdir -p /root/projects/iso_document/storage
chmod 755 /root/projects/iso_document/storage
```

---

## 🎨 Step 7: Configure Frontend

### 7.1 Install Frontend Dependencies

```bash
cd /root/projects/iso_document/frontend
# Install ALL dependencies (including dev dependencies needed for building)
npm install
```

### 7.2 Create Production .env File

```bash
cd /root/projects/iso_document/frontend
nano .env
```

**Paste this:**

```env
NEXT_PUBLIC_API_URL=https://iso.taskinsight.my/api
```

**Note:** You can also use `.env.local` if you prefer - Next.js supports both. `.env.local` takes precedence over `.env` if both exist.

### 7.3 Build Frontend

```bash
cd /root/projects/iso_document/frontend
npm run build
```

---

## 🔄 Step 8: Setup PM2 for Backend

### 8.1 Create PM2 Ecosystem File

```bash
cd /root/projects/iso_document

```

**Paste this:**

```javascript
module.exports = {
  apps: [
    {
      name: 'iso-backend',
      script: './backend/dist/main.js',
      cwd: '/root/projects/iso_document',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4007,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```

### 8.2 Create Logs Directory

```bash
mkdir -p /root/projects/iso_document/logs
```

### 8.3 Start Backend with PM2

```bash
cd /root/projects/iso_document
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Follow the command it outputs to enable PM2 on boot.**

---

## 🌐 Step 9: Configure Nginx

### 9.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/iso.taskinsight.my
```

**Paste this configuration:**

```nginx
# Backend API - Proxy to Node.js
# Using unique upstream name to avoid conflicts with other sites
upstream iso_backend {
    server localhost:4007;
    keepalive 64;
}

# Frontend - Next.js
server {
    listen 80;
    server_name iso.taskinsight.my www.iso.taskinsight.my;

    # Frontend
    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://iso_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for file uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 1G;
    }

    # File upload size limit
    client_max_body_size 1G;
}
```

### 9.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/iso.taskinsight.my /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

## 🔒 Step 10: Setup SSL with Let's Encrypt

### 10.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d iso.taskinsight.my -d www.iso.taskinsight.my
```

**Follow prompts:**
- Email: Enter your email
- Agree to terms: **Yes**
- Share email: **No** (or Yes, your choice)
- Redirect HTTP to HTTPS: **Yes**

### 10.3 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

---

## 🚀 Step 11: Start Frontend with PM2

### 11.1 Update PM2 Config

```bash
cd /root/projects/iso_document
nano ecosystem.config.js
```

**Update to include frontend:**

```javascript
module.exports = {
  apps: [
    {
      name: 'iso-backend',
      script: './backend/dist/main.js',
      cwd: '/root/projects/iso_document',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4007,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'iso-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/root/projects/iso_document/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```

### 11.2 Restart PM2

```bash
cd /root/projects/iso_document
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔧 Step 12: Update Nginx for HTTPS

### 12.1 Certbot Auto-Updated Nginx

Certbot should have automatically updated your Nginx config. Verify:

```bash
sudo cat /etc/nginx/sites-available/iso.taskinsight.my
```

**Should show SSL configuration with:**
- `listen 443 ssl;`
- SSL certificate paths
- Redirect from HTTP to HTTPS

### 12.2 Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Step 13: Verify Deployment

### 13.1 Check Services

```bash
# Check PM2 processes
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check MySQL
sudo systemctl status mysql
```

### 13.2 Test URLs

- **Frontend:** https://iso.taskinsight.my
- **Backend API:** https://iso.taskinsight.my/api
- **API Docs:** https://iso.taskinsight.my/api/docs

### 13.3 Check Logs

```bash
# Backend logs
pm2 logs iso-backend

# Frontend logs
pm2 logs iso-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔐 Step 14: Security Hardening

### 14.1 Configure Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 14.2 Secure MySQL

```bash
# Edit MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add these lines under [mysqld]:
bind-address = 127.0.0.1
skip-networking
```

```bash
sudo systemctl restart mysql
```

### 14.3 Set Proper File Permissions

```bash
cd /root/projects/iso_document
chmod 600 backend/.env
chmod 600 frontend/.env
chmod 755 storage
```

---

## 📊 Step 15: Monitoring & Maintenance

### 15.1 PM2 Monitoring

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all
```

### 15.2 Database Backup Script

```bash
cd /root/projects/iso_document
nano backup-db.sh
```

**Paste:**

```bash
#!/bin/bash
BACKUP_DIR="/root/projects/iso_document/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u iso_user -p'your-password' iso_document_system > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x /root/projects/iso_document/backup-db.sh
```

**Add to crontab (daily backup at 2 AM):**
```bash
crontab -e
# Add this line:
0 2 * * * /root/projects/iso_document/backup-db.sh
```

---

## 🔄 Step 16: Update Deployment

### 16.1 Update Process

```bash
cd /root/projects/iso_document

# Pull latest changes (if using Git)
git pull

# Update backend
cd backend
npm install  # Install all dependencies (needed for build)
npm run build

# Update frontend
cd ../frontend
npm install  # Install all dependencies (needed for build)
npm run build

# Restart services
cd ..
pm2 restart all
```

---

## 🐛 Troubleshooting

### 502 Bad Gateway Error

This error means Nginx cannot connect to your backend/frontend services. Follow these steps:

#### Step 1: Check if PM2 Services are Running

```bash
pm2 status
```

**Expected output:** Both `iso-backend` and `iso-frontend` should show status `online`

**If services are stopped or errored:**
```bash
# Check logs for errors
pm2 logs iso-backend --lines 50
pm2 logs iso-frontend --lines 50

# Restart services
pm2 restart all

# If still not working, delete and restart
pm2 delete all
cd /root/projects/iso_document
pm2 start ecosystem.config.js
pm2 save
```

#### Step 2: Verify Ports are Listening

```bash
# Check if backend is listening on port 4007
sudo netstat -tulpn | grep 4007
# or
sudo ss -tulpn | grep 4007

# Check if frontend is listening on port 3007
sudo netstat -tulpn | grep 3007
# or
sudo ss -tulpn | grep 3007
```

**Expected output:** Should show `LISTEN` on the respective ports

**If ports are not listening:**
- Services may have crashed → Check logs above
- Wrong port in configuration → See Step 3

#### Step 3: Verify Backend .env Port Configuration

```bash
cat /root/projects/iso_document/backend/.env | grep PORT
```

**Should show:** `PORT=4007`

**If wrong:**
```bash
cd /root/projects/iso_document/backend
nano .env
# Update PORT=4007
# Save and exit (Ctrl+X, Y, Enter)
pm2 restart iso-backend
```

#### Step 4: Verify PM2 Ecosystem Config

```bash
cat /root/projects/iso_document/ecosystem.config.js
```

**Verify:**
- Backend `PORT: 4007` (line ~308 or ~461)
- Frontend `PORT: 3007` (line ~479)
- Correct `cwd` paths

**If wrong, update and restart:**
```bash
cd /root/projects/iso_document
nano ecosystem.config.js
# Fix ports, save, then:
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

#### Step 5: Check Nginx Configuration Matches

```bash
sudo cat /etc/nginx/sites-available/iso.taskinsight.my | grep -A 2 "upstream\|proxy_pass"
```

**Verify:**
- `upstream iso_backend { server localhost:4007; }`
- `proxy_pass http://iso_backend;` (for /api location)
- `proxy_pass http://localhost:3007;` (for / location)

**If wrong, update:**
```bash
sudo nano /etc/nginx/sites-available/iso.taskinsight.my
# Fix upstream and proxy_pass, save, then:
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

**Look for:**
- `connect() failed (111: Connection refused)` → Backend not running
- `connect() failed (111: No route to host)` → Wrong port/address
- `upstream prematurely closed connection` → Backend crashed

#### Step 7: Test Backend Directly

```bash
# Test if backend responds directly (should work if backend is running)
curl http://localhost:4007/api
# or
curl http://localhost:4007/api/docs

# Test if frontend responds directly
curl http://localhost:3007
```

**If direct connection works but Nginx 502 persists:**
- Nginx config issue → Check Step 5
- Firewall blocking → Check Step 8

#### Step 8: Check Firewall/SELinux

```bash
# Check if firewall is blocking
sudo ufw status
# If active, ensure ports 3007 and 4007 are allowed locally (127.0.0.1 is always allowed)

# Check if any process is blocking
sudo lsof -i :4007
sudo lsof -i :3007
```

#### Step 9: Verify Backend Built Successfully

```bash
ls -la /root/projects/iso_document/backend/dist/main.js
```

**If file doesn't exist:**
```bash
cd /root/projects/iso_document/backend
npm run build
pm2 restart iso-backend
```

#### Step 10: Complete Restart Sequence

If nothing above works, try a complete restart:

```bash
# Stop everything
pm2 stop all

# Restart services
pm2 start all

# If still failing, delete and recreate
pm2 delete all
cd /root/projects/iso_document
pm2 start ecosystem.config.js
pm2 save

# Reload Nginx
sudo systemctl reload nginx

# Check status
pm2 status
pm2 logs --lines 20
```

---

### Backend Not Starting

```bash
# Check logs
pm2 logs iso-backend

# Check if port 4007 is in use
sudo netstat -tulpn | grep 4007

# Check .env file
cat backend/.env
```

### Frontend Not Loading / Frontend Errored in PM2

#### Step 1: Check Frontend Error Logs

```bash
# Check detailed error logs
pm2 logs iso-frontend --lines 100
pm2 logs iso-frontend --err --lines 50
```

**Common errors to look for:**
- `Module not found` → Missing dependencies
- `Cannot find module` → Build artifacts missing
- `Port already in use` → Port 3007 is taken
- `EADDRINUSE` → Port conflict
- `.next folder missing` → Frontend not built

#### Step 2: Verify Frontend Build

```bash
# Check if .next folder exists
ls -la /root/projects/iso_document/frontend/.next

# Check if .next folder has content
ls -la /root/projects/iso_document/frontend/.next/server
```

**If .next folder is missing or empty:**
```bash
cd /root/projects/iso_document/frontend
npm run build
```

#### Step 3: Check Port 3007 Availability

```bash
# Check if port 3007 is already in use
sudo netstat -tulpn | grep 3007
sudo lsof -i :3007

# If port is in use by another process, kill it or change port
```

#### Step 4: Verify Frontend .env File

```bash
cat /root/projects/iso_document/frontend/.env
```

**Should show:**
```env
NEXT_PUBLIC_API_URL=https://iso.taskinsight.my/api
```

**If missing or wrong:**
```bash
cd /root/projects/iso_document/frontend
nano .env
# Add: NEXT_PUBLIC_API_URL=https://iso.taskinsight.my/api
# Save: Ctrl+X, Y, Enter
```

#### Step 5: Reinstall Dependencies (if build fails)

```bash
cd /root/projects/iso_document/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Step 6: Check PM2 Ecosystem Config

```bash
cat /root/projects/iso_document/ecosystem.config.js
```

**Verify frontend config:**
- `cwd: '/root/projects/iso_document/frontend'`
- `PORT: 3007`
- `script: 'npm'`
- `args: 'start'`

#### Step 7: Test Frontend Manually

```bash
cd /root/projects/iso_document/frontend
npm start
```

**If manual start works but PM2 fails:**
- PM2 config issue → Fix ecosystem.config.js
- Working directory issue → Check cwd path

**If manual start also fails:**
- Check error message in terminal
- Fix the specific error (usually build or dependency issue)

#### Step 8: Restart Frontend in PM2

```bash
# Stop and delete frontend
pm2 delete iso-frontend

# Start again
cd /root/projects/iso_document
pm2 start ecosystem.config.js --only iso-frontend

# Check status
pm2 status
pm2 logs iso-frontend --lines 20
```

#### Step 9: Complete Frontend Reset

If still errored, do a complete reset:

```bash
cd /root/projects/iso_document/frontend

# Clean build artifacts
rm -rf .next node_modules

# Reinstall
npm install

# Rebuild
npm run build

# Restart in PM2
cd ..
pm2 delete iso-frontend
pm2 start ecosystem.config.js --only iso-frontend
pm2 save
```

#### Step 10: Check Next.js Configuration

```bash
cat /root/projects/iso_document/frontend/next.config.js
```

**Verify it exists and has correct configuration.**

### Database Connection Error

```bash
# Test MySQL connection
mysql -u iso_user -p iso_document_system

# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 📝 Quick Reference Commands

```bash
# PM2 Commands
pm2 status              # View all processes
pm2 logs                # View all logs
pm2 restart all         # Restart all
pm2 stop all            # Stop all
pm2 delete all          # Delete all

# Nginx Commands
sudo nginx -t           # Test config
sudo systemctl reload nginx  # Reload
sudo systemctl restart nginx # Restart

# MySQL Commands
sudo systemctl status mysql
sudo systemctl restart mysql

# View Logs
pm2 logs iso-backend
pm2 logs iso-frontend
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ Deployment Checklist

- [ ] VPS server ready
- [ ] Domain DNS pointed to VPS IP
- [ ] MySQL installed and database created
- [ ] Node.js 18+ installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Application files uploaded
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend built and running
- [ ] Frontend built and running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Services auto-start on boot
- [ ] Backup script configured
- [ ] All services running
- [ ] Website accessible via HTTPS

---

## 🎉 Success!

Your ISO Document Management System should now be live at:
**https://iso.taskinsight.my**

**Default Admin Login:**
- Email: admin@example.com
- Password: Admin@123

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services are running: `pm2 status`
4. Test database connection: `mysql -u iso_user -p`

---

**Happy Deployment! 🚀**
