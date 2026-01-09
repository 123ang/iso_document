# ISO Document Management System - Setup Guide

Complete installation and setup guide for the ISO Document Management System.

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **MySQL** 5.7+ or 8.0+ (XAMPP or standalone)
- **npm** or **yarn**
- **Git** (optional)

---

## 🚀 Installation Steps

### 1. Database Setup

#### Option A: Using XAMPP

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (`http://localhost/phpmyadmin`)
3. Create a new database named `iso_document_system`
4. Go to the SQL tab and run the following files in order:
   - Execute `database/schema.sql`
   - Execute `database/seed.sql`

#### Option B: Using MySQL CLI

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE iso_document_system;"

# Run schema
mysql -u root -p iso_document_system < database/schema.sql

# Run seed data
mysql -u root -p iso_document_system < database/seed.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Update database credentials if needed
nano .env  # or use any text editor
```

**Important .env settings:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=        # Your MySQL password (empty for XAMPP default)
DB_DATABASE=iso_document_system

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Storage
STORAGE_PATH=../storage
MAX_FILE_SIZE=1073741824  # 1GB in bytes
```

### 3. Create Storage Directory

```bash
# From project root
mkdir storage
chmod 755 storage  # On Linux/Mac
```

### 4. Start Backend Server

```bash
# From backend directory
npm run start:dev

# Backend will run on http://localhost:3000
# API documentation available at http://localhost:3000/api/docs
```

### 5. Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (frontend uses .env.local for Next.js)
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Start frontend development server
npm run dev

# Frontend will run on http://localhost:3001
```

---

## 🔐 Default Admin Credentials

After seeding the database, you can login with:

- **Email:** `admin@example.com`
- **Password:** `Admin@123`

⚠️ **Important:** Change the default admin password immediately after first login!

---

## 🎨 UUM Theme Colors

The system uses Universiti Utara Malaysia's official colors:

- **Primary (Maroon):** #8B1538
- **Secondary (Gold):** #D4AF37
- **Accent Colors:** Various shades of maroon and gold

---

## 📁 Project Structure

```
iso_document/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── groups/         # Group management
│   │   ├── document-sets/  # Document set management
│   │   ├── documents/      # Document management
│   │   ├── versions/       # Version control & file handling
│   │   └── audit/          # Audit logging
│   ├── .env.example
│   └── package.json
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── pages/         # Application pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # API client
│   │   ├── store/         # State management
│   │   ├── theme/         # UUM theme
│   │   └── i18n/          # Translations (EN/MS)
│   └── package.json
│
├── database/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Initial data
│
├── storage/               # File storage (auto-created)
│
└── README_ISO_Document_Management_System.md
```

---

## 🌐 API Documentation

Once the backend is running, visit:
**http://localhost:3000/api/docs**

This provides interactive Swagger documentation for all API endpoints.

---

## 🔧 Common Issues & Troubleshooting

### Database Connection Error

**Problem:** `ER_ACCESS_DENIED_ERROR` or connection timeout

**Solutions:**
1. Check MySQL is running (XAMPP Control Panel)
2. Verify credentials in `backend/.env`
3. Ensure database `iso_document_system` exists
4. For XAMPP, default username is `root` with **empty password**

### Port Already in Use

**Problem:** `Port 3000 is already in use`

**Solutions:**
1. Stop other applications using port 3000
2. Change port in `backend/.env`: `PORT=3001`
3. Update frontend API URL accordingly

### File Upload Errors

**Problem:** Cannot upload files

**Solutions:**
1. Ensure `storage` directory exists
2. Check directory permissions: `chmod 755 storage`
3. Verify `MAX_FILE_SIZE` in `.env`
4. Check available disk space

### Frontend Cannot Connect to Backend

**Problem:** API calls fail with network errors

**Solutions:**
1. Ensure backend is running on port 3000
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Verify CORS settings in backend
4. Check browser console for specific error messages

---

## 🌍 Language Support

The system supports:
- **English (en)** - Default
- **Bahasa Melayu (ms)** - Malay

Translation files located at:
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/ms.json`

---

## 👥 User Roles

### Admin
- Full system access
- Create/manage document sets
- Upload/manage documents
- Manage users and groups
- View audit logs
- Set document versions

### User
- View assigned document sets
- Download documents
- View current version only
- No admin access

---

## 📊 Features Implemented

✅ JWT Authentication
✅ Role-based Access Control (Admin/User)
✅ Group-based Document Access
✅ Document Versioning (Policy A)
✅ File Upload/Download (1GB limit)
✅ File Streaming (Secure)
✅ Document Preview (in-browser)
✅ Search Functionality
✅ Audit Logging
✅ Multi-language (English/Malay)
✅ UUM Theme Integration
✅ Responsive Design

---

## 🚀 Production Deployment

### Backend

1. **Build the application:**
   ```bash
   cd backend
   npm run build
   ```

2. **Update .env for production:**
   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret>
   DB_HOST=<production-db-host>
   DB_PASSWORD=<secure-password>
   CORS_ORIGIN=<your-frontend-domain>
   ```

3. **Start production server:**
   ```bash
   npm run start:prod
   ```

### Frontend

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Update environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

### Recommended Production Setup

- **Backend:** Deploy on VPS with PM2 process manager
- **Frontend:** Deploy on VPS or Vercel/Netlify
- **Database:** MySQL on same VPS or managed service
- **Reverse Proxy:** Nginx for SSL/TLS and load balancing
- **Storage:** Local filesystem or S3-compatible storage

---

## 📝 Additional Notes

- Default file size limit: **1GB per file**
- No file type restrictions (configurable)
- Audit logs track all admin actions
- Version history visible to admins only
- Users see only current version
- Supports rollback to previous versions

---

## 💡 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at `/api/docs`
3. Check backend logs for detailed error messages
4. Verify all environment variables are set correctly

---

## 📄 License

MIT License - Use freely for your organization.

---

**Happy Document Managing! 🎉**
