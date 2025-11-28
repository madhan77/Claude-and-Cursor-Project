# Automated Deployment Setup Guide

## 🚀 Auto-Deploy from GitHub (No Local Commands!)

This guide sets up **automatic deployment** every time you push to GitHub.

---

## ✅ One-Time Setup (10 minutes)

### **Step 1: Get Railway Token**

1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Copy the token

### **Step 2: Get Railway Project ID**

```bash
# On your Mac terminal, just once:
cd ~/Claude-and-Cursor-Project/airline-reservation-system/backend
railway login
railway init  # This creates a new project
railway status --json | grep projectId
# Copy the project ID
```

### **Step 3: Get Firebase Service Account**

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project (or create new one)
3. Click ⚙️ (Settings) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the JSON file
7. Copy the **entire JSON content**

### **Step 4: Add Secrets to GitHub**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `RAILWAY_TOKEN` | Your Railway token | Step 1 |
| `RAILWAY_PROJECT_ID` | Your Railway project ID | Step 2 |
| `FIREBASE_SERVICE_ACCOUNT` | Entire JSON from Firebase | Step 3 |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console |
| `VITE_API_URL` | `https://your-railway-app.up.railway.app/api/v1` | After first Railway deploy |

---

## 🎯 How It Works

### **Automatic Deployment**

Once set up, **every time you push** to GitHub:

1. ✅ GitHub Actions triggers
2. ✅ Backend deploys to Railway
3. ✅ Database migrates
4. ✅ Sample data seeds
5. ✅ Frontend builds
6. ✅ Frontend deploys to Firebase
7. ✅ You get live URLs!

**No commands needed!** Just push your code.

---

## 🎉 After Setup

### **To Deploy:**

```bash
# Just push your code!
git add .
git commit -m "Deploy updates"
git push
```

GitHub Actions will automatically deploy everything!

---

## 🔄 Manual Trigger

You can also trigger deployment manually:

1. Go to GitHub repo → **Actions**
2. Select "Deploy to Firebase & Railway"
3. Click **Run workflow**
4. Click **Run workflow** again

---

## 🆘 Need Help?

Let me know if you want:
- **A)** Automated setup (push → auto-deploy)
- **B)** Manual GitHub Actions (click to deploy)
- **C)** Simple local deployment instead

Which do you prefer? 🚀
