# 🤖 Automated Deployment Setup Guide

**Goal:** Automatically deploy to Render whenever you push to the `main` branch

**Time Required:** 5-10 minutes (one-time setup)

---

## ✅ What I've Created

I've created a GitHub Actions workflow that will:
- ✅ Trigger automatically on every push to `main` branch
- ✅ Only deploy when backend code changes
- ✅ Call Render's deploy hook to start deployment
- ✅ Provide deployment status in GitHub Actions tab

**File Created:** `.github/workflows/deploy-airline-backend.yml`

---

## 🔧 Setup Steps

### **STEP 1: Get Render Deploy Hook URL** (3 minutes)

1. **Go to Render Dashboard:**
   👉 https://dashboard.render.com/

2. **Select Your Service:**
   👉 Click on `airline-backend-nlsk`

3. **Go to Settings:**
   👉 Click **"Settings"** tab (left sidebar)

4. **Find Deploy Hook:**
   👉 Scroll down to **"Deploy Hook"** section
   👉 You'll see a URL that looks like:
   ```
   https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyy
   ```

5. **Copy the URL:**
   👉 Click the **"Copy"** button next to the deploy hook URL
   👉 **IMPORTANT:** Keep this URL secret! Don't share it publicly.

---

### **STEP 2: Add Deploy Hook to GitHub Secrets** (2 minutes)

1. **Go to Your GitHub Repository:**
   👉 https://github.com/madhan77/Claude-and-Cursor-Project

2. **Go to Settings:**
   👉 Click **"Settings"** tab (top navigation)

3. **Go to Secrets:**
   👉 Left sidebar → **"Secrets and variables"** → **"Actions"**

4. **Add New Secret:**
   👉 Click **"New repository secret"** button

5. **Enter Secret Details:**
   - **Name:** `RENDER_DEPLOY_HOOK_URL`
   - **Value:** Paste the deploy hook URL you copied from Render
   - Click **"Add secret"**

**IMPORTANT:** The name MUST be exactly `RENDER_DEPLOY_HOOK_URL` (case-sensitive)

---

### **STEP 3: Push the Workflow File** (2 minutes)

Now let's commit and push the GitHub Actions workflow:

```bash
# Add the workflow file
git add .github/workflows/deploy-airline-backend.yml
git add airline-reservation-system/AUTOMATED_DEPLOYMENT_SETUP.md

# Commit
git commit -m "Add automated deployment workflow for airline backend

- GitHub Actions will trigger Render deployment on push to main
- Only deploys when backend code changes
- Provides deployment status in Actions tab

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main
git push origin main
```

---

### **STEP 4: Verify Deployment** (5 minutes)

After pushing, the workflow should automatically trigger!

1. **Check GitHub Actions:**
   👉 Go to: https://github.com/madhan77/Claude-and-Cursor-Project/actions
   👉 You should see a new workflow run: "Deploy Airline Backend to Render"
   👉 Click on it to see the progress

2. **Monitor Render:**
   👉 Go to: https://dashboard.render.com/
   👉 Select: `airline-backend-nlsk`
   👉 Watch the "Events" tab
   👉 You should see a new deployment starting

3. **Wait for Completion:**
   - GitHub Actions: ~30 seconds (just triggers the deploy)
   - Render Deployment: ~5-7 minutes (actual build and deploy)

4. **Test After Deployment:**
   ```bash
   # Test health endpoint
   curl https://airline-backend-nlsk.onrender.com/health

   # Test booking endpoint (should now show detailed error)
   curl https://airline-backend-nlsk.onrender.com/api/v1/bookings/AL0KLL
   ```

---

## 🎉 How It Works (After Setup)

### **From Now On - It's Automatic!**

**Every time you push to main:**

```bash
# Make any changes to the backend
git add airline-reservation-system/backend/src/...
git commit -m "Your changes"
git push origin main

# ✨ AUTOMATIC DEPLOYMENT HAPPENS:
# 1. GitHub detects push to main
# 2. GitHub Actions workflow starts
# 3. Workflow calls Render deploy hook
# 4. Render starts building & deploying
# 5. ~5-7 minutes later: Live in production!
```

**You don't need to do ANYTHING else!** 🎉

---

## 📊 Monitoring Deployments

### **Option 1: GitHub Actions Tab**

👉 https://github.com/madhan77/Claude-and-Cursor-Project/actions

- See all deployment triggers
- Check if deploy hook was called successfully
- View deployment summaries

### **Option 2: Render Dashboard**

👉 https://dashboard.render.com/

- See actual build progress
- View build logs
- Monitor deployment status
- Check when deployment goes live

### **Option 3: Render Logs**

👉 Dashboard → Service → Logs

- See application logs
- Check for errors
- View the new emoji indicators (🔍 📊 ✅ ❌)

---

## 🔍 How the Workflow Works

### **Trigger Conditions:**

The workflow runs when:
- ✅ You push to the `main` branch
- ✅ AND changes include files in:
  - `airline-reservation-system/backend/**` (any backend code)
  - `.github/workflows/deploy-airline-backend.yml` (workflow file itself)

**It does NOT run when:**
- ❌ You push to other branches (like feature branches)
- ❌ You only change frontend code
- ❌ You only change documentation (unless in backend folder)

This saves resources and deployment time!

### **What the Workflow Does:**

1. **Checks out code** from GitHub
2. **Verifies** the deploy hook secret is configured
3. **Calls Render's deploy hook** via curl
4. **Checks response** to ensure it triggered successfully
5. **Creates summary** showing deployment status

---

## 🛠️ Troubleshooting

### **Issue: Workflow runs but deployment doesn't trigger**

**Check:**
1. Deploy hook URL is correct in GitHub Secrets
2. Secret name is exactly `RENDER_DEPLOY_HOOK_URL`
3. Render service is active (not paused)

**Fix:**
- Re-copy the deploy hook URL from Render
- Update the GitHub Secret
- Re-run the workflow

### **Issue: Workflow fails with "RENDER_DEPLOY_HOOK_URL secret not set"**

**Cause:** Secret not configured in GitHub

**Fix:**
1. Go to GitHub → Settings → Secrets → Actions
2. Add secret named `RENDER_DEPLOY_HOOK_URL`
3. Paste the Render deploy hook URL

### **Issue: GitHub Actions succeeds but Render doesn't deploy**

**Check Render:**
1. Go to Render Dashboard
2. Check if deploy hook is enabled
3. Check service isn't paused or suspended

**Fix:**
- Ensure service is active
- Manually trigger one deploy to "wake up" the service
- Check Render status page for any outages

### **Issue: Want to deploy manually (bypass automation)**

**You can still manually deploy:**
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. This works alongside the automation

---

## 🎯 Testing the Setup

### **Test 1: Trigger a Deployment**

Make a small change and push:

```bash
# Add a comment to a backend file
echo "// Test deployment automation" >> airline-reservation-system/backend/src/server.ts

# Commit and push
git add airline-reservation-system/backend/src/server.ts
git commit -m "Test automated deployment"
git push origin main

# Watch GitHub Actions
# Open: https://github.com/madhan77/Claude-and-Cursor-Project/actions
```

### **Test 2: Verify It Doesn't Trigger on Frontend Changes**

```bash
# Change frontend file
echo "// Frontend change" >> airline-reservation-system/frontend/src/App.tsx

# Commit and push
git add airline-reservation-system/frontend/src/App.tsx
git commit -m "Frontend change only"
git push origin main

# Workflow should NOT run (check GitHub Actions)
```

---

## 📋 Quick Reference

### **Deploy Hook URL Location:**
- Render Dashboard → Service → Settings → Deploy Hook

### **GitHub Secret Name:**
- Exactly: `RENDER_DEPLOY_HOOK_URL`

### **GitHub Actions Location:**
- https://github.com/YOUR_USERNAME/YOUR_REPO/actions

### **Workflow File:**
- `.github/workflows/deploy-airline-backend.yml`

---

## ✅ Setup Checklist

Complete this checklist to ensure everything is set up:

- [ ] Copied deploy hook URL from Render
- [ ] Added `RENDER_DEPLOY_HOOK_URL` secret to GitHub
- [ ] Committed workflow file to repository
- [ ] Pushed to main branch
- [ ] Verified workflow ran in GitHub Actions
- [ ] Verified deployment started in Render
- [ ] Tested deployed application
- [ ] Made a test change to verify automation works

---

## 🚀 Current Status

**Before Setup:**
- ❌ Manual deployment required every time
- ❌ Must remember to deploy via Render dashboard
- ❌ Easy to forget to deploy changes

**After Setup:**
- ✅ Automatic deployment on every push to main
- ✅ No manual intervention needed
- ✅ Always in sync with GitHub main branch
- ✅ Deployment history tracked in GitHub Actions

---

## 💡 Pro Tips

**1. Create Feature Branches:**
```bash
git checkout -b feature/my-feature
# Make changes
git push origin feature/my-feature
# Create PR to main
# Merge PR → automatic deployment!
```

**2. Monitor Deployments:**
- Star the GitHub Actions tab
- Enable GitHub notifications for workflow runs
- Set up Render email notifications

**3. Rollback if Needed:**
- Render keeps deployment history
- Can rollback to previous deployment in dashboard
- Or revert the git commit and push again

**4. Add More Environments:**
- Create separate workflows for staging
- Use different deploy hooks for different environments
- Deploy to staging on push to `develop` branch

---

## 🎊 You're All Set!

Once you complete the setup steps above:
- ✅ Automated deployments will be live
- ✅ Every push to main will deploy automatically
- ✅ You can focus on coding, not deploying

**Next Steps:**
1. Complete STEP 1: Get deploy hook URL from Render
2. Complete STEP 2: Add secret to GitHub
3. Complete STEP 3: Push the workflow file
4. Complete STEP 4: Verify it works!

Total time: ~10 minutes for one-time setup
Future deployments: **Fully automatic** ✨
