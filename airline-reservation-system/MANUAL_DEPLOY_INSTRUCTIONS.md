# Manual Deployment Instructions

**Issue:** Auto-deploy is not configured for the `airline-backend-nlsk` service on Render.

## 🔧 Quick Fix: Manual Deploy (2 minutes)

### Option 1: Trigger Manual Deploy in Dashboard

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/

2. **Select Your Backend Service:**
   - Click on: `airline-backend-nlsk`

3. **Trigger Manual Deploy:**
   - Click the **"Manual Deploy"** button (top right)
   - Select: **"Deploy latest commit"**
   - Branch: `main`
   - Click: **"Deploy"**

4. **Monitor Deployment:**
   - Watch the "Events" tab
   - Check "Logs" tab for build progress
   - Wait ~3-5 minutes

### Option 2: Using Render CLI (if installed)

```bash
# Install Render CLI (if not installed)
npm install -g @render/cli

# Login
render login

# Trigger deploy
render deploy --service airline-backend-nlsk
```

---

## ⚙️ Permanent Fix: Enable Auto-Deploy (5 minutes)

To enable automatic deployments for future pushes:

### Step 1: Configure Auto-Deploy in Dashboard

1. **Go to Service Settings:**
   - Dashboard → `airline-backend-nlsk` → **Settings**

2. **Find "Build & Deploy" Section:**
   - Scroll to "Build & Deploy" settings

3. **Configure Auto-Deploy:**
   - **Branch:** Change to `main` (if not already)
   - **Auto-Deploy:** Toggle **ON** (should be enabled)
   - **Build Command:** `cd airline-reservation-system/backend && npm install && npm run build`
   - **Start Command:** `cd airline-reservation-system/backend && npm start`

4. **Save Changes:**
   - Click **"Save Changes"**

### Step 2: Verify GitHub Connection

1. **Check GitHub Integration:**
   - Settings → **GitHub** section
   - Verify repository is connected: `madhan77/Claude-and-Cursor-Project`
   - Verify branch is set to: `main`

2. **Check Webhook:**
   - Ensure GitHub webhook is active
   - Render should automatically create this

### Step 3: Test Auto-Deploy

```bash
# Make a small change
echo "# Test auto-deploy" >> airline-reservation-system/README.md

# Commit and push
git add airline-reservation-system/README.md
git commit -m "Test auto-deploy configuration"
git push origin main

# Watch Render dashboard - should auto-deploy within 1-2 minutes
```

---

## 🔍 Troubleshooting Auto-Deploy

### Why Auto-Deploy Might Not Work:

1. **Wrong Branch:**
   - Service is watching a different branch
   - **Fix:** Set branch to `main` in settings

2. **Wrong Repository Path:**
   - Service is looking at the wrong directory
   - **Fix:** Update build command to include correct path:
     ```
     cd airline-reservation-system/backend && npm install && npm run build
     ```

3. **GitHub Webhook Not Active:**
   - Webhook not configured or deleted
   - **Fix:** Disconnect and reconnect GitHub integration

4. **Auto-Deploy Disabled:**
   - Setting is turned off
   - **Fix:** Enable in Settings → Auto-Deploy

### How to Check Auto-Deploy Status:

1. **Dashboard → Service → Settings**
2. Look for: "Auto-Deploy: **Enabled**" (should be green)
3. Branch should show: `main`

---

## 📋 Current Deployment Info

**Your Service:**
- Name: `airline-backend-nlsk`
- URL: https://airline-backend-nlsk.onrender.com
- Last Deploy: 22 hours ago
- Status: Deployed (but old version)

**What Needs to Deploy:**
- Latest commit: `0664bca6`
- Changes: Enhanced error logging for booking endpoint
- Branch: `main`

---

## 🚀 Quick Deploy Checklist

- [ ] Go to Render Dashboard
- [ ] Click on `airline-backend-nlsk`
- [ ] Click "Manual Deploy" button
- [ ] Select "Deploy latest commit"
- [ ] Choose branch: `main`
- [ ] Click "Deploy"
- [ ] Wait 3-5 minutes
- [ ] Test endpoint: `curl https://airline-backend-nlsk.onrender.com/health`
- [ ] Check logs for new emoji indicators (🔍 📊 ✅ ❌)

---

## ⚙️ Permanent Auto-Deploy Setup Checklist

- [ ] Open service settings
- [ ] Verify branch is `main`
- [ ] Verify auto-deploy is **ON**
- [ ] Update build command if needed
- [ ] Save changes
- [ ] Test with a small commit

---

## 🎯 What to Do Right Now:

**Immediate Action (2 minutes):**
1. Go to: https://dashboard.render.com/
2. Click: `airline-backend-nlsk`
3. Click: **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait 3-5 minutes for deployment

**Then Test:**
```bash
# Test health endpoint
curl https://airline-backend-nlsk.onrender.com/health

# Test booking endpoint
curl https://airline-backend-nlsk.onrender.com/api/v1/bookings/AL0KLL
```

**Then Setup Auto-Deploy (5 minutes):**
1. Go to Settings
2. Verify auto-deploy is enabled
3. Verify branch is `main`
4. Verify build/start commands include correct path
5. Save changes

---

## 📞 Need Help?

If manual deploy doesn't work:

1. **Check Build Logs:**
   - Dashboard → Service → Logs
   - Look for errors during `npm install` or `npm run build`

2. **Verify Build Command:**
   - Should be: `cd airline-reservation-system/backend && npm install && npm run build`
   - If your repo structure is different, adjust accordingly

3. **Check Environment Variables:**
   - Ensure DATABASE_URL is set
   - Ensure JWT_SECRET is set
   - Ensure all required env vars exist

---

**Summary:**
- Auto-deploy wasn't configured for your service
- Manual deploy is the quick fix (2 min)
- Setting up auto-deploy prevents this in future (5 min)
- Once configured, every push to `main` will auto-deploy

**Do This Now:**
1. Manual deploy via Render dashboard
2. Wait 3-5 minutes
3. Test the booking endpoint
4. Then configure auto-deploy for future
