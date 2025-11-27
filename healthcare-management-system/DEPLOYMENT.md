# Healthcare Management System - Deployment Guide

## 🚀 Deploy to Railway (Recommended)

Railway provides free PostgreSQL database and hosting for both frontend and backend.

---

## Prerequisites

1. **Railway Account** - Sign up at https://railway.app (free)
2. **GitHub Account** - Your code is already on GitHub
3. **5 minutes** - That's all it takes!

---

## 📋 Deployment Steps

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repository: `madhan77/Claude-and-Cursor-Project`
5. Railway will detect the monorepo

### Step 2: Deploy PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a PostgreSQL database
4. Note: Connection details are auto-configured

### Step 3: Deploy Backend API

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Configure the service:
   ```
   Root Directory: healthcare-management-system/services/api-gateway
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   ENCRYPTION_KEY=<generate-64-char-hex-string>
   ```

5. Railway will automatically connect to PostgreSQL (DATABASE_URL is auto-set)

6. Click **"Deploy"**

### Step 4: Run Database Migrations

1. In Railway dashboard, go to your API service
2. Click **"Variables"** tab
3. The database is already connected via `DATABASE_URL`
4. Migrations will run on first start (configured in code)

### Step 5: Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   ```
   Root Directory: healthcare-management-system/apps/web
   Build Command: npm install && npm run build
   Start Command: npx serve -s dist -l 80
   ```

4. Add environment variables:
   ```
   VITE_API_URL=<your-backend-url-from-step-3>
   ```
   Example: `https://healthcare-api-production.up.railway.app`

5. Click **"Deploy"**

### Step 6: Load Test Data

**Option 1: Using Railway Dashboard**
1. Go to PostgreSQL database in Railway
2. Click **"Data"** tab
3. Connect with CLI or run SQL queries
4. Copy content from `database/seeds/*.sql` and run

**Option 2: Using psql Client**
```bash
# Get DATABASE_URL from Railway dashboard
export DATABASE_URL="postgresql://..."

# Connect
psql $DATABASE_URL

# Run seed scripts
\i database/seeds/001_seed_users.sql
\i database/seeds/002_seed_patients.sql
```

**Option 3: API Endpoint (Create Later)**
- We can add a protected admin endpoint to seed data
- For now, use Option 1 or 2

---

## 🌐 Alternative: Deploy to Render

Render also provides free tier with PostgreSQL.

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Name: `healthcare-db`
3. Select **Free** tier
4. Click **"Create Database"**
5. Save the **Internal Database URL**

### Step 3: Deploy Backend

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   ```
   Name: healthcare-api
   Root Directory: healthcare-management-system/services/api-gateway
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

4. Add environment variables:
   ```
   DATABASE_URL=<from-step-2>
   NODE_ENV=production
   JWT_SECRET=<random-string>
   JWT_REFRESH_SECRET=<random-string>
   ```

5. Click **"Create Web Service"**

### Step 4: Deploy Frontend

1. Click **"New"** → **"Static Site"**
2. Connect your GitHub repo
3. Configure:
   ```
   Name: healthcare-web
   Root Directory: healthcare-management-system/apps/web
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. Add environment variable:
   ```
   VITE_API_URL=<your-backend-url>
   ```

5. Click **"Create Static Site"**

---

## 🌐 Alternative: Deploy to Vercel + Railway

**Frontend on Vercel** (Best for React/Vite):

1. Go to https://vercel.com
2. Import your GitHub repo
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: healthcare-management-system/apps/web
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```
5. Deploy!

**Backend on Railway** (Follow Step 2-4 from Railway guide above)

---

## 📝 Post-Deployment Checklist

### After Backend Deploys

1. ✅ Check logs for errors
2. ✅ Verify database connection
3. ✅ Test health endpoint: `https://your-api-url.railway.app/api/v1/health`
4. ✅ Test API docs: `https://your-api-url.railway.app/api/docs`

### After Frontend Deploys

1. ✅ Open the URL
2. ✅ Check browser console for errors
3. ✅ Verify API connection
4. ✅ Test login page loads

### Load Test Data

1. ✅ Connect to PostgreSQL database
2. ✅ Run migration scripts (auto-run on first deploy)
3. ✅ Run seed scripts:
   - `database/seeds/001_seed_users.sql` (10 users)
   - `database/seeds/002_seed_patients.sql` (5 patients)
4. ✅ Verify data: `SELECT COUNT(*) FROM healthcare.users;`

### Test the Application

1. ✅ Open frontend URL
2. ✅ Login with: `admin@healthcare.com` / `Password123!`
3. ✅ Check dashboard loads
4. ✅ Navigate to Patients page
5. ✅ Navigate to Users page
6. ✅ Test search functionality
7. ✅ Test logout

---

## 🔐 Security Configuration

### Generate Secure Secrets

**JWT Secret** (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Encryption Key** (64 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update Environment Variables

In Railway/Render dashboard, set:
- `JWT_SECRET`: Generated secret above
- `JWT_REFRESH_SECRET`: Different generated secret
- `ENCRYPTION_KEY`: Generated 64-char hex string
- `ALLOWED_ORIGINS`: Your frontend URL

---

## 📊 Expected Results

### Backend API (Railway)
```
✅ URL: https://healthcare-api-production.up.railway.app
✅ Health: /api/v1/health
✅ Docs: /api/docs
✅ Status: 200 OK
```

### Frontend (Railway/Vercel)
```
✅ URL: https://healthcare-web-production.up.railway.app
✅ Login Page: Loads correctly
✅ API Connection: Working
✅ Status: 200 OK
```

### Database (Railway PostgreSQL)
```
✅ Users: 10 records
✅ Patients: 5 records
✅ Appointments: 6 types (default)
✅ Status: Connected
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check logs in Railway:**
```
- Database connection errors?
- Missing environment variables?
- Build errors?
```

**Common fixes:**
1. Verify `DATABASE_URL` is set
2. Check `NODE_ENV=production`
3. Ensure all migrations ran
4. Check start command: `npm run start:prod`

### Frontend Can't Connect to API

**Check:**
1. `VITE_API_URL` is set correctly
2. Backend URL is accessible
3. CORS is configured (should be in code)
4. API is actually running

**Fix CORS if needed:**
In `services/api-gateway/src/main.ts`, verify:
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});
```

### Database Connection Issues

**Check:**
1. PostgreSQL service is running
2. `DATABASE_URL` environment variable is set
3. Database migrations completed
4. Network connectivity

**Manual migration:**
```bash
# In Railway dashboard → PostgreSQL → Connect
psql $DATABASE_URL

# Run migration files manually
\i 001_create_users_table.sql
```

### Test Data Not Loaded

**Load manually:**
1. Get `DATABASE_URL` from Railway
2. Connect: `psql $DATABASE_URL`
3. Run: `\i database/seeds/001_seed_users.sql`
4. Run: `\i database/seeds/002_seed_patients.sql`
5. Verify: `SELECT COUNT(*) FROM healthcare.users;`

---

## 🎯 Quick Deploy Commands

### Using Railway CLI (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy backend
cd services/api-gateway
railway up

# Deploy frontend
cd ../../apps/web
railway up
```

---

## 📞 Support

If deployment fails:
1. Check Railway/Render logs
2. Verify environment variables
3. Check build output
4. Test API health endpoint
5. Review browser console

---

## ✅ Success Criteria

Your deployment is successful when:

✅ Backend API responds at `/api/v1/health`
✅ API documentation loads at `/api/docs`
✅ Frontend loads without errors
✅ Login page is visible
✅ Can login with test credentials
✅ Dashboard displays after login
✅ Patients and Users pages show data
✅ No console errors in browser
✅ No 500 errors in API logs

---

## 🎉 You're Live!

Once deployed, share these URLs:

**Application:** `https://your-frontend-url`
**API Docs:** `https://your-backend-url/api/docs`
**Test Login:** `admin@healthcare.com` / `Password123!`

---

**Ready to deploy? Start with Railway - it's the easiest!**

Visit: https://railway.app and click "Start a New Project"
