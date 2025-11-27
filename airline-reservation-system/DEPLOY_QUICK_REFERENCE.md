# Quick Deployment Reference

## 🚀 Fastest: Railway + Vercel (15 minutes)

### Step 1: Deploy Backend to Railway

```bash
# Option A: Railway Dashboard (Easier)
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select this repository
4. Add PostgreSQL database
5. Set environment variables:
   - JWT_SECRET=your_random_secret_32chars
   - JWT_REFRESH_SECRET=different_random_secret_32chars
   - FRONTEND_URL=https://your-app.vercel.app

# Option B: Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway add --plugin postgresql
railway up
railway run npm run migrate
railway run npm run seed
```

**Get your Railway URL:** `https://your-app.up.railway.app`

### Step 2: Deploy Frontend to Vercel

```bash
# Option A: Vercel Dashboard (Easier)
1. Go to https://vercel.com/new
2. Import from GitHub
3. Root Directory: airline-reservation-system/frontend
4. Framework: Vite
5. Environment Variable:
   - VITE_API_URL=https://your-backend.up.railway.app/api/v1
6. Deploy

# Option B: Vercel CLI
npm install -g vercel
cd frontend
vercel --prod
# Add env: VITE_API_URL=https://your-backend.up.railway.app/api/v1
```

**Get your Vercel URL:** `https://your-app.vercel.app`

### Step 3: Update Backend CORS

In Railway dashboard, add/update:
```
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Test

Visit `https://your-app.vercel.app` and:
- [x] Search for flights (JFK → LAX)
- [x] Register account
- [x] Make a booking
- [x] View bookings

---

## 🐳 Alternative: Docker (Local/VPS)

### One-Command Deploy

```bash
# Clone repository
git clone <your-repo>
cd airline-reservation-system

# Setup environment
cp .env.production.example .env
# Edit .env with your secrets

# Deploy everything
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

**Access at:**
- Frontend: http://localhost
- Backend: http://localhost:5000
- Database: localhost:5432

---

## 🔑 Required Environment Variables

### Backend (.env or Railway/Render dashboard)

```env
# REQUIRED
JWT_SECRET=your_32_character_random_string
JWT_REFRESH_SECRET=different_32_character_random_string
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=https://your-frontend-url.com

# AUTO-PROVIDED (Railway/Render)
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel dashboard)

```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## 🔧 Generate Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-backend/health`
- [ ] Frontend loads: Visit your Vercel URL
- [ ] Can search flights
- [ ] Can register user
- [ ] Can create booking
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Database is seeded with sample data

---

## 🐛 Common Issues

### Backend: Database Connection Failed
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Railway auto-provides this
# For Render, copy from database page
```

### Frontend: API Calls Fail (CORS Error)
```bash
# Check backend environment:
FRONTEND_URL=https://your-exact-vercel-url.com  # No trailing slash!

# Check frontend environment:
VITE_API_URL=https://your-backend-url.com/api/v1
```

### Database: Tables Not Created
```bash
# Railway:
railway run npm run migrate

# Render:
# Use Render shell from dashboard
npm run migrate

# Docker:
docker-compose exec backend npm run migrate
```

---

## 📊 Deployment Costs

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Railway | ✅ $5 credit | $5-20/mo |
| Vercel | ✅ Generous | $20/mo |
| Render | ✅ Limited | $7-15/mo |
| Docker (DO) | ❌ | $6-12/mo |

**Recommended for MVP:** Railway Free + Vercel Free = $0/mo*
*Free credits usually last 1-2 months for low traffic

---

## 🎯 Quick Commands

```bash
# Check deployment script
./deploy.sh

# Railway CLI
railway login
railway up
railway logs
railway run npm run migrate

# Vercel CLI
vercel login
vercel --prod
vercel env add

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 📞 Need Help?

1. Check DEPLOYMENT.md for detailed guide
2. Review platform logs
3. Verify environment variables
4. Test API endpoints directly

---

**Total Time:** ~15 minutes
**Status:** ✅ Ready to Deploy
