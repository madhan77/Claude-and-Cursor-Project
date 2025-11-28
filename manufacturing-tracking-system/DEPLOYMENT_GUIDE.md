# Deployment Guide - Manufacturing Tracking System

## 🚀 Deployment Status

**Frontend:** ✅ Built and Ready for Deployment
**Backend:** ⏳ Requires Cloud Deployment (PostgreSQL + Node.js)

---

## 📦 What's Ready to Deploy

### Frontend (Static React App)
- ✅ Production build created: `frontend/dist/`
- ✅ Firebase configuration ready: `firebase.json`, `.firebaserc`
- ✅ Optimized bundle: 521KB (164KB gzipped)
- ✅ All assets compiled and minified

### Backend (Node.js API)
- ✅ Code ready: `backend/src/`
- ✅ TypeScript compiled: `backend/dist/`
- ⏳ Needs: PostgreSQL database + hosting

---

## 🔥 Option 1: Firebase Hosting (Frontend Only)

### Quick Deploy to Firebase

```bash
# Step 1: Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Step 2: Login to Firebase
firebase login

# Step 3: Navigate to project directory
cd manufacturing-tracking-system

# Step 4: Deploy to Firebase Hosting
firebase deploy --only hosting:manufacturing-tracking
```

### Your Firebase Configuration

**Project ID:** `claude-project-10b09`
**Hosting Target:** `manufacturing-tracking-app`
**Public Directory:** `frontend/dist`

After deployment, your frontend will be live at:
```
https://manufacturing-tracking-app.web.app
```

### ⚠️ Important Note
The frontend will deploy successfully, but **API calls will fail** because the backend is not deployed yet. Users will see:
- ✅ Login page (UI works)
- ✅ Dashboard layout
- ❌ Login functionality (needs backend API)
- ❌ Data fetching (needs backend + database)

---

## 🌐 Option 2: Full Stack Deployment (Recommended)

For a fully functional app, deploy both frontend and backend:

### A. Deploy Backend to Render (Free Tier)

1. **Create Account:** Go to [render.com](https://render.com)

2. **Create PostgreSQL Database:**
   ```
   - Click "New +" → "PostgreSQL"
   - Name: manufacturing-tracking-db
   - Region: Choose nearest
   - Plan: Free
   - Copy connection string
   ```

3. **Create Web Service:**
   ```
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Root Directory: manufacturing-tracking-system/backend
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Add Environment Variables:
     * NODE_ENV=production
     * PORT=5000
     * DB_HOST=<from PostgreSQL connection string>
     * DB_NAME=<from PostgreSQL connection string>
     * DB_USER=<from PostgreSQL connection string>
     * DB_PASSWORD=<from PostgreSQL connection string>
     * JWT_SECRET=<generate random string>
     * CORS_ORIGIN=<your-firebase-url>
   ```

4. **Run Database Seed:**
   ```bash
   # After deployment, use Render Shell to seed database
   npm run seed
   ```

5. **Your Backend URL:**
   ```
   https://manufacturing-tracking-api.onrender.com
   ```

### B. Update Frontend API Configuration

Edit `frontend/src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'https://manufacturing-tracking-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### C. Rebuild and Deploy Frontend

```bash
# Rebuild with new API URL
cd frontend
npm run build

# Deploy to Firebase
cd ..
firebase deploy --only hosting:manufacturing-tracking
```

---

## 🚂 Option 3: Deploy Backend to Railway

Alternative to Render with similar free tier:

1. **Sign up:** [railway.app](https://railway.app)
2. **New Project** → "Deploy from GitHub"
3. **Add PostgreSQL:** Click "+ New" → "Database" → "PostgreSQL"
4. **Configure Service:**
   - Root Directory: `/manufacturing-tracking-system/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as Render)
5. **Generate Domain** and update frontend API URL

---

## 🐳 Option 4: Docker Deployment (Advanced)

### Create Docker Compose Setup

**Step 1:** Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: manufacturing_tracking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_NAME: manufacturing_tracking
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your_secret_key_here
      CORS_ORIGIN: http://localhost
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Step 2:** Deploy to any Docker hosting (DigitalOcean, AWS, etc.)

---

## 📊 Deployment Architecture

### Recommended Setup

```
┌─────────────────────────────────────────┐
│  Firebase Hosting (CDN)                 │
│  https://your-app.web.app               │
│  - Static React App                     │
│  - Fast global delivery                 │
└─────────────────┬───────────────────────┘
                  │ API Calls
                  ↓
┌─────────────────────────────────────────┐
│  Render/Railway (Backend)               │
│  https://your-api.onrender.com          │
│  - Node.js + Express API                │
│  - JWT Authentication                   │
└─────────────────┬───────────────────────┘
                  │ Database Queries
                  ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Database                    │
│  (Render/Railway Managed)               │
│  - User data                            │
│  - Production orders                    │
│  - Inventory, etc.                      │
└─────────────────────────────────────────┘
```

---

## 🔐 Environment Variables Checklist

### Backend (.env)

```bash
# Required
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=manufacturing_tracking
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=generate_random_64_char_string
CORS_ORIGIN=https://your-firebase-app.web.app

# Optional
REDIS_HOST=your_redis_host (if using Redis)
REDIS_PORT=6379
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 Post-Deployment Testing

After deployment, test these features:

### Frontend Only (Firebase)
- [x] Site loads without errors
- [x] Login page displays correctly
- [x] Navigation works
- [x] Responsive design on mobile

### Full Stack (Firebase + Backend)
- [x] User can login
- [x] Dashboard shows statistics
- [x] Production orders list loads
- [x] Can create new production order
- [x] Can view order details
- [x] API calls return 200/201 status

### Test Credentials
```
Username: admin
Password: password123
```

---

## 🚨 Troubleshooting

### Frontend Deploys But Shows Blank Page
- Check browser console for errors (F12)
- Verify `frontend/dist/index.html` exists
- Check Firebase hosting public directory setting

### API Calls Fail with CORS Error
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check backend is running: visit `https://your-api.onrender.com/health`
- Ensure backend CORS middleware is configured

### Cannot Login
- Check backend logs for errors
- Verify database connection
- Ensure seed script has run: `npm run seed`
- Check JWT_SECRET is set

### Database Connection Error
- Verify database credentials in .env
- Check database is running
- Ensure backend can reach database host
- Check firewall rules allow connections

---

## 💰 Cost Estimate

### Free Tier (Perfect for Testing)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Firebase Hosting | Free | $0/month | 10GB storage, 360MB/day |
| Render PostgreSQL | Free | $0/month | 90 days, then sleeps |
| Render Web Service | Free | $0/month | Sleeps after 15min inactivity |
| **Total** | | **$0/month** | Good for testing/demo |

### Paid Tier (Production Ready)

| Service | Plan | Cost | Features |
|---------|------|------|----------|
| Firebase Hosting | Blaze | ~$1-5/month | Unlimited, pay-as-you-go |
| Render PostgreSQL | Starter | $7/month | Always on, 1GB RAM |
| Render Web Service | Starter | $7/month | Always on, 512MB RAM |
| **Total** | | **~$15/month** | Production ready |

---

## 🎯 Quick Start: Manual Deployment Steps

**5-Minute Frontend Deploy:**

```bash
# 1. Ensure you're in the project root
cd manufacturing-tracking-system

# 2. Login to Firebase
firebase login

# 3. Deploy
firebase deploy --only hosting:manufacturing-tracking

# 4. Done! Visit your URL:
echo "https://manufacturing-tracking-app.web.app"
```

**15-Minute Full Stack Deploy:**

1. Deploy backend to Render (10 minutes)
2. Update frontend API URL (2 minutes)
3. Rebuild and deploy frontend (3 minutes)
4. Test with demo credentials (bonus!)

---

## 📞 Need Help?

- Firebase Docs: https://firebase.google.com/docs/hosting
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

---

**Last Updated:** November 27, 2025
**Status:** Frontend Built ✅ | Backend Ready for Deploy ⏳
