# 🔧 Quick Fix for Login 500 Error

## Step-by-Step Solution

### ✅ Step 1: Database is Working!
Your database connection test passed! The admin user exists.

### Step 2: Check Backend is Running

**Open a NEW terminal window and run:**

```bash
cd backend
npm run start:dev
```

**You should see:**
```
🚀 Application is running on: http://localhost:3000/api
📚 Swagger documentation: http://localhost:3000/api/docs
```

**If you see errors, note them down!**

---

### Step 3: Test Backend API Directly

**While backend is running, open another terminal and test:**

```bash
# Using curl (if you have it)
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin@123\"}"
```

**Or use Postman/Thunder Client:**
- URL: `POST http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

---

### Step 4: Check Backend Terminal for Errors

**Look for these common errors:**

#### Error: "Cannot find module"
```bash
# Solution: Install dependencies
cd backend
npm install
```

#### Error: "ER_ACCESS_DENIED_ERROR"
```bash
# Solution: Check backend/.env
# DB_USERNAME=root
# DB_PASSWORD= (empty for XAMPP)
```

#### Error: "ECONNREFUSED"
```bash
# Solution: Start MySQL in XAMPP
# Or: sudo systemctl start mysql
```

#### Error: "Table doesn't exist"
```bash
# Solution: Run schema
mysql -u root -p iso_document_system < database/schema.sql
```

---

### Step 5: Verify TypeORM Entities

**Check if entities are being loaded:**

The backend should show TypeORM logging if `NODE_ENV=development` in `.env`.

**If you see entity loading errors, check:**
```bash
# Verify entity files exist
ls backend/src/**/*.entity.ts
```

---

### Step 6: Common Fixes

#### Fix 1: Rebuild Backend
```bash
cd backend
npm run build
npm run start:dev
```

#### Fix 2: Clear and Reinstall
```bash
cd backend
rm -rf node_modules dist
npm install
npm run build
npm run start:dev
```

#### Fix 3: Check Port 3000
```bash
# Windows: Check if port is in use
netstat -ano | findstr :3000

# If something is using it, kill it or change PORT in .env
```

#### Fix 4: Verify .env File
```bash
cd backend
cat .env
# Should show:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=
# DB_DATABASE=iso_document_system
```

---

### Step 7: Enable Detailed Logging

**Edit `backend/src/main.ts` temporarily to see more errors:**

The backend should already log errors. Check the terminal where `npm run start:dev` is running.

---

## 🎯 Most Likely Issues

### Issue 1: Backend Not Running
**Solution:** Start backend in a terminal:
```bash
cd backend
npm run start:dev
```

### Issue 2: TypeORM Can't Find Entities
**Solution:** Check entity paths in `app.module.ts`:
```typescript
entities: [__dirname + '/**/*.entity{.ts,.js}'],
```

### Issue 3: Missing Dependencies
**Solution:**
```bash
cd backend
npm install
```

### Issue 4: Database Connection String Wrong
**Solution:** Double-check `backend/.env`:
- Empty password for XAMPP: `DB_PASSWORD=`
- No spaces around `=`

---

## 🔍 Debug Checklist

- [ ] Backend terminal shows: "Application is running on: http://localhost:3000/api"
- [ ] Can access: http://localhost:3000/api/docs
- [ ] Database test passed: `node backend/test-connection.js`
- [ ] MySQL is running (XAMPP green)
- [ ] `.env` file exists in `backend/` folder
- [ ] `node_modules` exists in `backend/` folder
- [ ] No errors in backend terminal

---

## 📞 Still Not Working?

**Share the error message from:**
1. Backend terminal (where `npm run start:dev` is running)
2. Browser console (F12 → Console tab)
3. Network tab (F12 → Network → Click on the failed request)

**Common error messages and fixes:**

| Error | Solution |
|-------|----------|
| `Cannot find module '@nestjs/...'` | Run `npm install` in backend |
| `ER_ACCESS_DENIED_ERROR` | Check DB credentials in `.env` |
| `ECONNREFUSED` | Start MySQL |
| `Table 'users' doesn't exist` | Run `schema.sql` |
| `Port 3000 already in use` | Kill process or change PORT |

---

## ✅ Quick Test Command

**Run this to test everything at once:**

```bash
# Test database
cd backend
node test-connection.js

# If that works, start backend
npm run start:dev
```

**Then in browser:**
- Open: http://localhost:3000/api/docs
- Try the `/api/auth/login` endpoint
- Check the response

---

**The database connection works, so the issue is likely:**
1. Backend not running
2. TypeORM entity loading
3. Missing npm packages

**Start the backend and check the terminal output!**
