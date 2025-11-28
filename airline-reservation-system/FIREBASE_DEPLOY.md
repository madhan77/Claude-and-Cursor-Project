# Firebase Deployment Guide - Airline Reservation System

## Quick Firebase Deployment (15 minutes)

This guide deploys:
- **Frontend** → Firebase Hosting (Static CDN)
- **Backend** → Railway (Node.js + PostgreSQL)

### Why This Combo?
- ✅ Firebase Hosting: Free, fast CDN, auto-SSL
- ✅ Railway: PostgreSQL support, easy backend deployment
- ✅ Best of both worlds

---

## 🚀 Automated Deployment

### Option 1: One-Command Deploy (Recommended)

```bash
cd airline-reservation-system
./deploy-firebase.sh
```

This script will:
1. ✅ Check dependencies
2. ✅ Deploy backend to Railway
3. ✅ Add PostgreSQL database
4. ✅ Set environment variables
5. ✅ Run database migrations
6. ✅ Seed sample data
7. ✅ Build frontend
8. ✅ Deploy to Firebase Hosting
9. ✅ Configure CORS
10. ✅ Generate deployment summary

**Total time:** ~15 minutes

---

## 📖 Manual Deployment (Step-by-Step)

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Railway CLI
npm install -g @railway/cli

# Login to both
firebase login
railway login
```

### Step 1: Deploy Backend to Railway (10 minutes)

```bash
cd backend

# Initialize Railway project
railway init

# Add PostgreSQL database
railway add --plugin postgresql

# Deploy backend
railway up

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="${JWT_SECRET}"
railway variables set JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"
railway variables set FRONTEND_URL="https://your-project.web.app"

# Run database setup
railway run npm run migrate
railway run npm run seed

# Get your backend URL
railway status
# Copy the URL (e.g., https://your-app.up.railway.app)
```

### Step 2: Deploy Frontend to Firebase (5 minutes)

```bash
cd ../frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
EOF

# Build frontend
npm install
npm run build

# Initialize Firebase (first time only)
cd ..
firebase init hosting
# Choose:
# - Use existing project or create new
# - Public directory: frontend/dist
# - Single-page app: Yes
# - GitHub deploys: No (for now)

# Deploy to Firebase
firebase deploy --only hosting

# Get your Firebase URL
firebase hosting:channel:list
# Your URL will be like: https://your-project.web.app
```

### Step 3: Update Backend CORS

```bash
cd backend

# Update FRONTEND_URL with your Firebase URL
railway variables set FRONTEND_URL="https://your-project.web.app"
```

---

## 🔧 Firebase Configuration Files

### firebase.json (Already created)

```json
{
  "hosting": {
    "public": "frontend/dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### .firebaserc (Configure your project)

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## 🌐 After Deployment

### Your Live URLs

- **Frontend:** `https://your-project.web.app`
- **Backend API:** `https://your-app.up.railway.app`
- **Health Check:** `https://your-app.up.railway.app/health`

### Test Your Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-app.up.railway.app/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Airline Reservation API is running"
   }
   ```

2. **Frontend Access:**
   - Open `https://your-project.web.app`
   - Should see the home page with flight search

3. **Complete Flow Test:**
   - Search: JFK → LAX
   - Register account
   - Make a booking
   - View bookings

---

## 🔑 Environment Variables Reference

### Railway Backend Variables

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<auto-provided-by-railway>
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-refresh-secret>
FRONTEND_URL=https://your-project.web.app
BACKEND_URL=https://your-app.up.railway.app
```

### Frontend Build Environment

```env
# frontend/.env.production
VITE_API_URL=https://your-app.up.railway.app/api/v1
```

---

## 📊 Sample Data Included

After deployment, you can test with:

### Flight Routes:
- **JFK → LAX** (New York to LA) - $299
- **JFK → LHR** (New York to London) - $599
- **SFO → NRT** (SF to Tokyo) - $899
- **ORD → MIA** (Chicago to Miami) - $199
- **BOS → LAX** (Boston to LA) - $319

### Airlines:
- American Airlines (AA)
- United Airlines (UA)
- Delta Air Lines (DL)
- British Airways (BA)
- Emirates (EK)
- More...

---

## 🔄 Redeployment

### Update Backend

```bash
cd backend
# Make your changes
git commit -m "Update backend"
railway up
```

### Update Frontend

```bash
cd frontend
# Make your changes
npm run build
cd ..
firebase deploy --only hosting
```

---

## 📱 Custom Domain (Optional)

### Add to Firebase Hosting

```bash
firebase hosting:channel:deploy production --expires 30d
firebase hosting:sites:update your-project
```

Or via Firebase Console:
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow verification steps
4. Add DNS records to your domain provider

---

## 🔍 Monitoring & Logs

### Backend Logs (Railway)

```bash
cd backend
railway logs
railway logs --follow  # Live logs
```

### Frontend Analytics (Firebase)

1. Go to Firebase Console
2. Navigate to Hosting
3. View traffic and performance metrics

---

## 🐛 Troubleshooting

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
```bash
# Ensure FRONTEND_URL matches your Firebase URL exactly
cd backend
railway variables set FRONTEND_URL="https://your-project.web.app"
# No trailing slash!
```

### Build Fails

**Problem:** Frontend build errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

**Problem:** Backend can't connect to database

**Solution:**
```bash
# Check if PostgreSQL is added
railway variables | grep DATABASE_URL

# If not present, add it
railway add --plugin postgresql
```

### Deployment Not Updating

**Problem:** Changes not reflected

**Solution:**
```bash
# Clear Firebase cache
firebase hosting:channel:delete preview

# Force rebuild
cd frontend
rm -rf dist
npm run build

# Redeploy
firebase deploy --only hosting --force
```

---

## 💰 Cost Estimate

### Firebase Hosting
- **Free Tier:** 10 GB storage, 360 MB/day transfer
- **Cost:** $0/month for most MVPs
- **Blaze (Pay-as-you-go):** ~$0-5/month

### Railway
- **Trial:** $5 free credit
- **Hobby:** $5/month (after trial)
- **Pro:** $20/month

**Total:** ~$0-5/month (depending on usage)

---

## 🎯 Deployment Checklist

- [ ] Firebase CLI installed
- [ ] Railway CLI installed
- [ ] Logged into Firebase
- [ ] Logged into Railway
- [ ] Backend deployed
- [ ] PostgreSQL added
- [ ] Database migrated
- [ ] Database seeded
- [ ] Frontend built
- [ ] Frontend deployed
- [ ] CORS configured
- [ ] Health check passes
- [ ] Can search flights
- [ ] Can create booking
- [ ] URLs documented

---

## 📞 Support

If you encounter issues:

1. **Check deployment script output**
2. **Review Railway logs:** `railway logs`
3. **Check Firebase status:** `firebase hosting:channel:list`
4. **Verify environment variables:** `railway variables`
5. **Test health endpoint:** `curl https://your-backend/health`

---

## ✅ Ready to Deploy?

Run the automated script:

```bash
cd airline-reservation-system
./deploy-firebase.sh
```

Or follow the manual steps above.

**Estimated time:** 15 minutes
**Result:** Fully deployed airline reservation system!

---

**After deployment, you'll receive a `DEPLOYMENT_SUMMARY.md` with all your live URLs and testing instructions.**

🚀 Happy Deploying!
