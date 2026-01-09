# 🔧 Troubleshooting Guide

## Login Errors (404/500)

### Error: `Failed to load resource: the server responded with a status of 404`

**Cause:** Backend server is not running or API URL is incorrect.

**Solution:**
1. Check if backend is running:
   ```bash
   cd backend
   npm run start:dev
   ```
2. Verify backend is accessible:
   - Open: http://localhost:3000/api/docs
   - Should show Swagger documentation
3. Check frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

---

### Error: `Failed to load resource: the server responded with a status of 500`

**Cause:** Backend is running but encountering an error (usually database connection or audit logging).

**Solution:**

#### 1. Check Database Connection

```bash
# Verify MySQL is running (XAMPP)
# Check XAMPP Control Panel - MySQL should be green

# Test database connection
mysql -u root -p
# Enter password (empty for XAMPP default)
```

#### 2. Verify Database Exists

```bash
mysql -u root -p -e "SHOW DATABASES;"
# Should see: iso_document_system
```

#### 3. Check Backend Logs

```bash
cd backend
npm run start:dev
# Look for error messages in terminal
```

**Common Database Errors:**
- `ER_ACCESS_DENIED_ERROR` → Wrong username/password in `backend/.env`
- `ECONNREFUSED` → MySQL not running
- `ER_BAD_DB_ERROR` → Database doesn't exist

#### 4. Re-run Database Setup

```bash
# If database doesn't exist or is empty:
mysql -u root -p iso_document_system < database/schema.sql
mysql -u root -p iso_document_system < database/seed.sql
```

#### 5. Check Backend .env File

```bash
cd backend
cat .env
# Verify:
# - DB_HOST=localhost
# - DB_PORT=3306
# - DB_USERNAME=root
# - DB_PASSWORD= (empty for XAMPP)
# - DB_DATABASE=iso_document_system
```

#### 6. Fix Audit Logging Issue

The login error might be caused by audit logging failing. This has been fixed in the code, but if you still see errors:

- The audit service will now log errors but won't fail the login
- Check if `audit_logs` table exists:
  ```sql
  SHOW TABLES LIKE 'audit_logs';
  ```

---

## Quick Fix Checklist

1. ✅ **Backend Running?**
   ```bash
   # Terminal 1
   cd backend
   npm run start:dev
   # Should see: "🚀 Application is running on: http://localhost:3000/api"
   ```

2. ✅ **Frontend Running?**
   ```bash
   # Terminal 2
   cd frontend
   npm run dev
   # Should see: "ready - started server on 0.0.0.0:3001"
   ```

3. ✅ **MySQL Running?**
   - XAMPP Control Panel: MySQL should be green
   - Or: `sudo systemctl status mysql` (Linux)

4. ✅ **Database Created?**
   ```sql
   SHOW DATABASES;
   -- Should see: iso_document_system
   ```

5. ✅ **Tables Exist?**
   ```sql
   USE iso_document_system;
   SHOW TABLES;
   -- Should see: users, groups, document_sets, etc.
   ```

6. ✅ **Admin User Exists?**
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   -- Should return 1 row
   ```

7. ✅ **Environment Files Correct?**
   - `backend/.env` - Database credentials correct
   - `frontend/.env.local` - API URL correct

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check MySQL is running
# XAMPP: Start MySQL from Control Panel
# Linux: sudo systemctl start mysql

# Test connection
mysql -u root -p
```

### Issue: "Table doesn't exist"

**Solution:**
```bash
# Re-run schema
mysql -u root -p iso_document_system < database/schema.sql
```

### Issue: "No admin user found"

**Solution:**
```bash
# Re-run seed
mysql -u root -p iso_document_system < database/seed.sql
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find process using port 3000
# Windows:
netstat -ano | findstr :3000

# Kill process or change port in backend/.env
PORT=3001
```

### Issue: "CORS error"

**Solution:**
- Check `backend/.env`:
  ```env
  CORS_ORIGIN=http://localhost:3001
  ```
- Restart backend after changing .env

---

## Testing Login

### Test Backend API Directly

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'

# Should return:
# {"access_token":"...","user":{...}}
```

### Test Database Connection

```bash
# From backend directory
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'iso_document_system'
    });
    console.log('✅ Database connected!');
    await conn.end();
  } catch (err) {
    console.error('❌ Database error:', err.message);
  }
})();
"
```

---

## Still Having Issues?

1. **Check Backend Logs:**
   ```bash
   cd backend
   npm run start:dev
   # Look for error messages
   ```

2. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify All Services:**
   - Backend: http://localhost:3000/api/docs
   - Frontend: http://localhost:3001
   - MySQL: Running in XAMPP

4. **Restart Everything:**
   ```bash
   # Stop all processes (Ctrl+C)
   # Then restart:
   cd backend && npm run start:dev
   cd frontend && npm run dev
   ```

---

## Theme Color Changes

The theme has been updated to **Blue & Yellow** to match UUM's official branding.

**New Colors:**
- Primary: Blue (#003366)
- Secondary: Yellow/Gold (#FFD700)
- Based on: https://www.uum.edu.my/

If colors don't update:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart frontend: `npm run dev`
3. Hard refresh: Ctrl+F5

---

**Need More Help?** Check the main README.md or SETUP_GUIDE.md
