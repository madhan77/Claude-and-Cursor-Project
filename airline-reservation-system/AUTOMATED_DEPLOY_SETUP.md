# 🤖 Automated Deployment - Complete Setup Guide

## ✅ What's Been Created

I've set up **two automated deployment methods** for you:

### 1. **Local Deployment Script** (`deploy-to-render.sh`)
- One-command deployment from your machine
- Commits changes, pushes to GitHub, triggers Render

### 2. **GitHub Actions Workflow** (`.github/workflows/deploy-airline-backend.yml`)
- Automatic deployment on every push to main
- No manual intervention needed

---

## 🚀 Quick Start - Choose Your Method

### **Method 1: Local Script (Recommended for Testing)**

```bash
cd airline-reservation-system
./deploy-to-render.sh
```

**First time setup (one-time):**
```bash
# Get your Render deploy hook URL from:
# https://dashboard.render.com/ → airline-backend-nlsk → Settings → Deploy Hook

# Save it in git config (secure and permanent):
git config render.deployhook 'YOUR_DEPLOY_HOOK_URL_HERE'

# Now you can deploy anytime:
./deploy-to-render.sh
```

**What it does:**
1. ✅ Commits your changes
2. ✅ Pushes to GitHub
3. ✅ Triggers Render deployment
4. ✅ Shows status and next steps

---

### **Method 2: GitHub Actions (Recommended for Production)**

**One-time setup:**

1. **Get Render Deploy Hook:**
   - Go to: https://dashboard.render.com/
   - Click: `airline-backend-nlsk`
   - Click: Settings → Deploy Hook
   - Click: Copy

2. **Add to GitHub Secrets:**
   - Go to: https://github.com/madhan77/Claude-and-Cursor-Project/settings/secrets/actions
   - Click: "New repository secret"
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: Paste the deploy hook URL
   - Click: "Add secret"

3. **Done!** Now every push to main automatically deploys!

**How to use:**
```bash
# Just push your changes - deployment happens automatically!
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically triggers Render deployment
# Monitor at: https://github.com/madhan77/Claude-and-Cursor-Project/actions
```

---

## 📋 Current Render Configuration

**These settings are required in Render Dashboard:**

Go to: https://dashboard.render.com/ → `airline-backend-nlsk` → Settings

### **Root Directory:**
```
airline-reservation-system/backend
```

### **Build Command:**
```bash
rm -rf dist && npm install --production=false && npm run build
```

### **Start Command:**
```bash
npm start
```

### **Environment Variables:**
- `NODE_ENV` = `production`
- `DATABASE_URL` = (from your database)
- `JWT_SECRET` = (auto-generated or your secret)
- `JWT_REFRESH_SECRET` = (auto-generated or your secret)
- `PORT` = `10000`
- `FRONTEND_URL` = Your frontend URL

---

## 🔧 How It Works

### **Build Process:**
1. `rm -rf dist` - Clears old compiled JavaScript
2. `npm install --production=false` - Installs ALL dependencies (including TypeScript)
3. `npm run build` - Compiles TypeScript to JavaScript
4. Fresh deployment with latest code!

### **Why --production=false?**
- Render sets `NODE_ENV=production` by default
- This skips `devDependencies` during `npm install`
- But we NEED TypeScript and @types/* to compile!
- `--production=false` forces installation of all dependencies

---

## 🧪 Testing Deployments

After deployment completes (~5-7 min), test with:

```bash
cd airline-reservation-system
./test-deployment.sh
```

Or manually:
```bash
# Health check
curl https://airline-backend-nlsk.onrender.com/health

# Booking endpoint (should show detailed errors now!)
curl https://airline-backend-nlsk.onrender.com/api/v1/bookings/AL0KLL
```

---

## 📊 Monitoring Deployments

### **Render Dashboard:**
- https://dashboard.render.com/
- Click: `airline-backend-nlsk`
- Tabs:
  - **Events**: Deployment history
  - **Logs**: Real-time server logs (look for 🔍 📊 emojis!)
  - **Metrics**: Performance stats

### **GitHub Actions:**
- https://github.com/madhan77/Claude-and-Cursor-Project/actions
- See workflow runs
- View deployment status
- Check error messages

---

## 🎯 Deployment Workflow

### **Using Local Script:**
```
You edit code
    ↓
./deploy-to-render.sh
    ↓
Script commits & pushes
    ↓
Script triggers Render
    ↓
Render builds & deploys
    ↓
✅ Live in 5-7 minutes
```

### **Using GitHub Actions:**
```
You edit code
    ↓
git push origin main
    ↓
GitHub detects push
    ↓
Workflow triggers Render
    ↓
Render builds & deploys
    ↓
✅ Live in 5-7 minutes
```

---

## 🛠️ Troubleshooting

### **Issue: Local script says "RENDER_DEPLOY_HOOK_URL not found"**

**Solution:**
```bash
# Get deploy hook from Render Dashboard
# Then save it:
git config render.deployhook 'your-deploy-hook-url'
```

### **Issue: GitHub Actions workflow fails**

**Check:**
1. Is `RENDER_DEPLOY_HOOK_URL` secret added to GitHub?
2. Go to: https://github.com/madhan77/Claude-and-Cursor-Project/settings/secrets/actions
3. Verify the secret exists and is spelled correctly

### **Issue: Build fails with TypeScript errors**

**Verify Render settings:**
- Build Command: `rm -rf dist && npm install --production=false && npm run build`
- The `--production=false` is critical!

### **Issue: Deployment succeeds but still shows old code**

**Solution:**
1. Go to Render Dashboard
2. Click: "Clear build cache & deploy"
3. This forces a completely fresh build

---

## 📝 Files Created

```
airline-reservation-system/
├── deploy-to-render.sh          # Local deployment script
├── test-deployment.sh           # Test deployed endpoints
└── AUTOMATED_DEPLOY_SETUP.md    # This guide

.github/
└── workflows/
    └── deploy-airline-backend.yml  # GitHub Actions workflow
```

---

## 🎊 Benefits

**Before:**
- ❌ Manual commits
- ❌ Manual GitHub push
- ❌ Manual Render deployment
- ❌ Multiple steps, easy to forget

**After:**
- ✅ One command: `./deploy-to-render.sh`
- ✅ Or automatic on push!
- ✅ No manual Render steps
- ✅ Always in sync

---

## 🚀 Next Steps

1. **Set up your preferred method:**
   - Local script: `git config render.deployhook 'url'`
   - GitHub Actions: Add secret to GitHub

2. **Update Render settings:**
   - Build Command: `rm -rf dist && npm install --production=false && npm run build`

3. **Test deployment:**
   - `./deploy-to-render.sh` (local)
   - Or `git push origin main` (GitHub Actions)

4. **Monitor and test:**
   - Check Render Dashboard
   - Run `./test-deployment.sh` after 5-7 minutes

---

## 💡 Pro Tips

**1. Use branches for features:**
```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature
# Create PR → Merge to main → Auto-deploys!
```

**2. Manual trigger GitHub Actions:**
- Go to: https://github.com/madhan77/Claude-and-Cursor-Project/actions
- Click: "Deploy Airline Backend to Render"
- Click: "Run workflow"

**3. Check logs for debugging:**
```bash
# Render logs will show:
🔍 Fetching booking with ID/PNR: AL0KLL
📊 Booking query result: { rowCount: 0 }
⚠️ Booking not found for ID/PNR: AL0KLL
```

---

**Happy Deploying! 🚀**
