# 🐛 Debug Login 500 Error - Step by Step

## ✅ What We Know Works:
- ✅ Database connection is OK
- ✅ Admin user exists (admin@example.com)
- ✅ Database tables exist

## 🔍 What to Check:

### Step 1: Is Backend Running?

**Open a terminal and run:**
```bash
cd backend
npm run start:dev
```

**You MUST see this message:**
```
🚀 Application is running on: http://localhost:3000/api
📚 Swagger documentation: http://localhost:3000/api/docs
```

**If you see errors instead, copy the FULL error message!**

---

### Step 2: Check Backend Terminal Output

**When you try to login, watch the backend terminal. You should see:**

```
[Nest] LOG [TypeOrmModule] TypeORM successfully connected to database
```

**If you see database errors, that's the problem!**

---

### Step 3: Test API Directly

**While backend is running, test in browser:**

1. Open: http://localhost:3000/api/docs
2. Find `/api/auth/login` endpoint
3. Click "Try it out"
4. Enter:
   - email: `admin@example.com`
   - password: `Admin@123`
5. Click "Execute"
6. **What error do you see?**

---

### Step 4: Check Common Errors

#### Error: "Cannot find module"
```bash
cd backend
npm install
```

#### Error: "ER_ACCESS_DENIED_ERROR"
- Check `backend/.env`:
  - `DB_USERNAME=root`
  - `DB_PASSWORD=` (empty, no spaces)

#### Error: "ECONNREFUSED"
- Start MySQL in XAMPP Control Panel
- MySQL should be GREEN

#### Error: "Table doesn't exist"
```bash
mysql -u root -p iso_document_system < database/schema.sql
```

#### Error: "TypeORM entity not found"
- This is fixed in the code now
- Restart backend: `npm run start:dev`

---

### Step 5: Enable More Logging

**The backend should already log errors. Check the terminal where you run `npm run start:dev`.**

**Look for:**
- Red error messages
- Stack traces
- Database connection errors

---

## 🎯 Most Common Issue:

### Backend Not Running!

**Solution:**
1. Open a NEW terminal window
2. Run: `cd backend && npm run start:dev`
3. Wait for: "Application is running on: http://localhost:3000/api"
4. **Keep this terminal open!**
5. Try login again in browser

---

## 📋 Quick Checklist:

Run this checklist:

```bash
# 1. Check MySQL is running
# (XAMPP Control Panel - MySQL should be green)

# 2. Test database
cd backend
node test-connection.js
# Should show: ✅ All checks passed!

# 3. Start backend
npm run start:dev
# Should show: 🚀 Application is running on: http://localhost:3000/api

# 4. Test in browser
# Open: http://localhost:3000/api/docs
# Try the login endpoint
```

---

## 🔧 If Still Not Working:

**Share these details:**

1. **Backend terminal output** (the full error message)
2. **Browser console error** (F12 → Console)
3. **Network tab** (F12 → Network → Click failed request → Response tab)

**The error message will tell us exactly what's wrong!**

---

## 💡 Quick Fixes to Try:

### Fix 1: Restart Everything
```bash
# Stop backend (Ctrl+C)
# Then:
cd backend
npm run start:dev
```

### Fix 2: Rebuild
```bash
cd backend
npm run build
npm run start:dev
```

### Fix 3: Clear Cache
```bash
cd backend
rm -rf node_modules dist
npm install
npm run build
npm run start:dev
```

### Fix 4: Check Port
```bash
# Windows:
netstat -ano | findstr :3000

# If something is using port 3000, kill it or change PORT in .env
```

---

## ✅ Expected Behavior:

**When everything works:**

1. Backend terminal shows: `🚀 Application is running on: http://localhost:3000/api`
2. Browser can access: http://localhost:3000/api/docs
3. Login request returns: `{ "access_token": "...", "user": {...} }`
4. Frontend redirects to dashboard

**If any step fails, that's where the problem is!**

---

**Start the backend and check the terminal output - that will show the exact error!**
