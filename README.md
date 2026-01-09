# 🏛️ ISO Document Management System

A **role-based ISO document management system** built for **Universiti Utara Malaysia (UUM)** with form-based administration, group access control, and version management.

![Tech Stack](https://img.shields.io/badge/Stack-NestJS%20%7C%20Next.js%20%7C%20MySQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20MS-orange)

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Two roles: **Admin** and **User**
- Group-based access control
- Secure session management

### 📁 Document Management
- **Document Sets** - Logical containers for documents
- **Version Control** - Track all document versions
- **Policy A Versioning** - Users see only current version
- **Admin Version Control** - Set any version as current
- **Rollback Support** - Revert to previous versions

### 📤 File Handling
- Upload files up to **1GB**
- **No file type restrictions**
- Secure file streaming (no public links)
- In-browser document preview
- SHA-256 checksum verification

### 🔍 Additional Features
- Full-text search for documents
- Comprehensive audit logging
- **Bilingual support** (English & Malay)
- **UUM-themed UI** (Maroon & Gold colors)
- Responsive design for all devices

---

## 🖥️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** MySQL 8.0
- **Authentication:** JWT + Passport
- **API Docs:** Swagger/OpenAPI
- **File Upload:** Multer
- **ORM:** TypeORM

### Frontend
- **Framework:** Next.js 14 (React 18)
- **UI Library:** Material-UI (MUI)
- **State Management:** Zustand
- **API Client:** Axios
- **Internationalization:** i18next
- **Date Handling:** date-fns

---

## 📦 Installation

### Quick Start

```bash
# 1. Clone the repository (if using Git)
git clone <your-repo-url>
cd iso_document

# 2. Setup Database (using XAMPP or MySQL)
# Create database: iso_document_system
# Run: database/schema.sql
# Run: database/seed.sql

# 3. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run start:dev

# 4. Setup Frontend (in new terminal)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
npm run dev

# 5. Create storage directory (in project root)
mkdir storage
```

### Access the Application

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **API Docs:** http://localhost:3000/api/docs

### Default Login

- **Email:** admin@example.com
- **Password:** Admin@123

---

## 📚 Detailed Setup Guide

For complete installation instructions, troubleshooting, and production deployment:

👉 **[Read SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🎨 UUM Theme

The system uses **Universiti Utara Malaysia's** official brand colors:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **UUM Maroon** | `#8B1538` | Primary buttons, headers, branding |
| **UUM Gold** | `#D4AF37` | Accents, highlights, icons |
| **Dark Maroon** | `#5C0E24` | Hover states, emphasis |
| **Light Gold** | `#F5E6C8` | Backgrounds, selected states |

---

## 👥 User Roles & Permissions

### Admin Role

✅ Create/edit/delete document sets
✅ Upload documents and new versions
✅ Set current version (publish/rollback)
✅ Manage users and groups
✅ View version history
✅ Access audit logs
✅ Full system access

### User Role

✅ View assigned document sets
✅ Download current version
✅ Preview documents in browser
✅ Search documents
❌ Cannot see version history
❌ No admin functions

---

## 🔄 Document Versioning (Policy A)

```
Upload New Version → Admin Reviews → Set as Current → Users See It
                                   ↓
                         Rollback Anytime to Previous Version
```

- Only **one version** marked as current
- Users see **only the current version**
- Admins see **all versions** and can switch between them
- Perfect for ISO document control requirements

---

## 📂 Project Structure

```
iso_document/
│
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # JWT authentication
│   │   ├── users/             # User management
│   │   ├── groups/            # Group management
│   │   ├── document-sets/     # Document sets
│   │   ├── documents/         # Document management
│   │   ├── versions/          # Version control & file upload
│   │   ├── audit/             # Audit logging
│   │   └── main.ts           # Application entry
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── pages/            # Application pages
│   │   │   ├── index.tsx     # Home/redirect
│   │   │   ├── login.tsx     # Login page
│   │   │   ├── dashboard.tsx # User dashboard
│   │   │   ├── my-documents.tsx  # User's accessible documents
│   │   │   ├── documents/    # Document viewing
│   │   │   └── admin/        # Admin management pages
│   │   ├── components/       # Reusable components
│   │   │   └── Layout/       # Layout components
│   │   ├── lib/              # API client & utilities
│   │   ├── store/            # State management (Zustand)
│   │   ├── theme/            # UUM theme configuration
│   │   └── i18n/             # Translations (EN/MS)
│   └── package.json
│
├── database/
│   ├── schema.sql            # MySQL database schema
│   └── seed.sql              # Initial admin user & sample data
│
├── storage/                   # File storage (created on setup)
│
├── SETUP_GUIDE.md            # Detailed setup instructions
└── README.md                 # This file
```

---

## 🌍 Internationalization

Supports **two languages**:

- 🇬🇧 **English** - Default language
- 🇲🇾 **Bahasa Melayu** - Full translation

Users can switch languages from the top navigation bar.

Translation files:
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/ms.json`

---

## 🔌 API Endpoints

### Public Endpoints
```
POST /api/auth/login          # User login
```

### User Endpoints (Authenticated)
```
GET  /api/auth/profile        # Get user profile
GET  /api/document-sets/my    # Get accessible document sets
GET  /api/documents/search    # Search documents
GET  /api/versions/:id/view   # View document (preview)
GET  /api/versions/:id/download  # Download document
```

### Admin Endpoints (Admin Only)
```
POST /api/document-sets       # Create document set
POST /api/documents           # Create document
POST /api/versions/upload     # Upload new version
POST /api/versions/:id/set-current  # Set current version
GET  /api/users               # List users
POST /api/users               # Create user
GET  /api/groups              # List groups
POST /api/groups              # Create group
GET  /api/audit               # View audit logs
```

Full API documentation available at: **http://localhost:3000/api/docs**

---

## 🛡️ Security Features

- ✅ JWT authentication with expiration
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Group-based document access
- ✅ File access via API only (no direct URLs)
- ✅ Audit logging for all admin actions
- ✅ Input validation & sanitization
- ✅ CORS configuration

---

## 📊 Database Schema

### Core Tables

- **users** - User accounts
- **groups** - Access groups
- **user_groups** - User-group mapping
- **document_sets** - Document containers
- **document_set_groups** - Document set access control
- **documents** - Document metadata
- **document_versions** - Version information & file paths
- **audit_logs** - System activity tracking

For complete schema, see: `database/schema.sql`

---

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

### Recommended Production Stack
- **Server:** Ubuntu 20.04+ VPS
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx with SSL/TLS
- **Database:** MySQL 8.0
- **Storage:** Local filesystem or S3

See **SETUP_GUIDE.md** for detailed production deployment.

---

## 🧪 Testing Checklist

### User Functions
- [ ] Login with admin credentials
- [ ] View dashboard
- [ ] Browse accessible document sets
- [ ] View documents in a set
- [ ] Preview document in browser
- [ ] Download document
- [ ] Search documents
- [ ] Switch between English/Malay

### Admin Functions
- [ ] Create document set
- [ ] Assign groups to document set
- [ ] Upload document
- [ ] Upload new version
- [ ] Set version as current
- [ ] Create user
- [ ] Create group
- [ ] View audit logs

---

## 📝 Sample Data

The seed script (`database/seed.sql`) includes:

- ✅ 1 Admin user
- ✅ 4 Groups (Management, QA, All Staff, Auditors)
- ✅ 4 Document Sets (ISO 9001, Internal Audit, Meeting Minutes, Online Documents)
- ✅ 5 Sample documents (without files)

---

## 🤝 Contributing

This is a custom system built for UUM. For modifications:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - Free to use for your organization.

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure MySQL is running
- Check credentials in `backend/.env`
- Verify database exists

**File Upload Fails**
- Check `storage` directory exists and is writable
- Verify `MAX_FILE_SIZE` in `.env`

**Frontend Can't Connect**
- Ensure backend is running on port 3000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

For more help, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🎯 System Requirements

- **Node.js:** 18.x or higher
- **MySQL:** 5.7+ or 8.0+
- **RAM:** Minimum 2GB (4GB recommended)
- **Disk Space:** 10GB+ (for file storage)
- **OS:** Windows, Linux, or macOS

---

## ⭐ Features Roadmap

Future enhancements:
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] Advanced search filters
- [ ] Document approval workflow
- [ ] Document expiry tracking
- [ ] S3-compatible storage integration
- [ ] Mobile app (React Native)

---

## 🏆 Built With

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)

</div>

---

<div align="center">

**Made for Universiti Utara Malaysia** 🎓

[Report Bug](mailto:your-email@example.com) · [Request Feature](mailto:your-email@example.com)

</div>
