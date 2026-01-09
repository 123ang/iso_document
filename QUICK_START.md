# 🚀 Quick Start Guide - 5 Minutes Setup

Follow these steps to get the ISO Document Management System running quickly.

---

## ⚡ Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MySQL running (XAMPP or standalone)
- [ ] Terminal/Command Prompt open

---

## 📝 Step-by-Step Setup

### Step 1: Database Setup (2 minutes)

**Using XAMPP:**
1. Start XAMPP
2. Click "Start" for MySQL
3. Open browser: `http://localhost/phpmyadmin`
4. Click "New" to create database
5. Name it: `iso_document_system`
6. Click "SQL" tab
7. Copy and paste contents of `database/schema.sql`
8. Click "Go"
9. Repeat for `database/seed.sql`

**Using MySQL Command Line:**
```bash
mysql -u root -p -e "CREATE DATABASE iso_document_system;"
mysql -u root -p iso_document_system < database/schema.sql
mysql -u root -p iso_document_system < database/seed.sql
```

---

### Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend folder
cd backend

# Install packages (this may take a minute)
npm install

# Copy environment file
cp .env.example .env

# For Windows Command Prompt:
# copy .env.example .env

# Edit .env if needed (usually works with defaults for XAMPP)
# If using XAMPP, DB_PASSWORD should be empty
```

**Quick .env check:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=           # Leave empty for XAMPP
DB_DATABASE=iso_document_system
```

---

### Step 3: Create Storage Folder (10 seconds)

```bash
# Go back to project root
cd ..

# Create storage directory
mkdir storage

# For Windows Command Prompt:
# md storage
```

---

### Step 4: Start Backend (30 seconds)

```bash
# From backend folder
cd backend
npm run start:dev

# Wait until you see:
# 🚀 Application is running on: http://localhost:3000/api
# 📚 Swagger documentation: http://localhost:3000/api/docs
```

**Leave this terminal running!**

---

### Step 5: Frontend Setup (1 minute)

**Open a NEW terminal window:**

```bash
# Navigate to frontend folder
cd frontend

# Install packages
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# For Windows PowerShell:
# "NEXT_PUBLIC_API_URL=http://localhost:3000/api" | Out-File -FilePath .env.local -Encoding utf8

# For Windows Command Prompt, create .env.local manually with:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

### Step 6: Start Frontend (30 seconds)

```bash
# From frontend folder
npm run dev

# Wait until you see:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3001
```

---

## 🎉 You're Done!

Open your browser and go to:
**http://localhost:3001**

### Login Credentials

```
Email: admin@example.com
Password: Admin@123
```

---

## ✅ Quick Test Checklist

After logging in, try these:

1. ✅ View Dashboard
2. ✅ Click "My Documents"
3. ✅ Click on a Document Set (e.g., "ISO 9001:2015")
4. ✅ Switch language (EN/MS) in top right
5. ✅ Admin: Go to "Document Sets" in sidebar

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MySQL is running
# For XAMPP: Open XAMPP Control Panel

# Check if port 3000 is available
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000
```

### Frontend won't start
```bash
# Check if port 3001 is available
# Change port if needed:
npm run dev -- -p 3002
```

### Can't login
- Check backend is running (should see console logs)
- Verify you ran both `schema.sql` AND `seed.sql`
- Check browser console (F12) for errors

### Database errors
- Verify MySQL is running
- Check database name: `iso_document_system`
- For XAMPP: username=`root`, password=`empty`

---

## 📁 What Got Installed?

### Backend Created:
- ✅ Database with tables
- ✅ Admin user account
- ✅ 4 sample groups
- ✅ 4 sample document sets
- ✅ REST API on port 3000

### Frontend Created:
- ✅ Web interface on port 3001
- ✅ UUM-themed UI
- ✅ English & Malay support

---

## 🔥 Quick Commands Reference

### Stop Everything
```bash
# In each terminal, press: Ctrl+C (Windows/Linux) or Cmd+C (Mac)
```

### Restart Backend
```bash
cd backend
npm run start:dev
```

### Restart Frontend
```bash
cd frontend
npm run dev
```

### View API Documentation
Open: **http://localhost:3000/api/docs**

---

## 📚 Next Steps

Now that you're up and running:

1. **Change Admin Password** (Security!)
2. **Create Users** - Go to Admin → Users
3. **Create Groups** - Go to Admin → Groups
4. **Create Document Sets** - Go to Admin → Document Sets
5. **Upload Documents** - Go to Admin → Documents

---

## 💡 Pro Tips

### Use Two Browser Windows
- **Window 1:** Admin view (logged in as admin)
- **Window 2:** User view (create a user and login)

### Test the Full Workflow
1. Admin creates document set
2. Admin assigns group to document set
3. Admin uploads document
4. User logs in and sees document
5. User downloads/previews document

### Explore API Docs
Visit `http://localhost:3000/api/docs` to see all available endpoints and try them out!

---

## 📞 Need Help?

If you're stuck:
1. Check **SETUP_GUIDE.md** for detailed troubleshooting
2. Verify all steps were completed in order
3. Check terminal/console for error messages
4. Make sure both backend and frontend are running

---

## 🎯 Success Indicators

You know it's working when:
- ✅ Login page loads with UUM colors (maroon/gold)
- ✅ You can login with admin credentials
- ✅ Dashboard shows statistics
- ✅ Document sets appear in sidebar
- ✅ Language switcher works (EN ⟷ MS)

---

**Happy Document Managing! 🎊**

Total setup time: **~5 minutes** ⏱️
