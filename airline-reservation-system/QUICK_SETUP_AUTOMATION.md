# ⚡ Quick Setup: Automated Deployment (5 Minutes)

---

## 🎯 **STEP 1: Get Your Deploy Hook from Render** (2 min)

### Copy this URL:

👉 **Go here:** https://dashboard.render.com/

1. Click on: **`airline-backend-nlsk`**
2. Click: **Settings** (left sidebar)
3. Scroll to: **Deploy Hook**
4. Click: **Copy** button

You'll get a URL like this:
```
https://api.render.com/deploy/srv-xxxxx?key=yyyyy
```

**✋ STOP! Keep this URL - you'll need it in Step 2**

---

## 🔐 **STEP 2: Add Secret to GitHub** (2 min)

### Paste the URL as a GitHub secret:

👉 **Go here:** https://github.com/madhan77/Claude-and-Cursor-Project/settings/secrets/actions

1. Click: **"New repository secret"**

2. Enter:
   - **Name:** `RENDER_DEPLOY_HOOK_URL`
   - **Secret:** Paste the URL from Step 1

3. Click: **"Add secret"**

---

## ✅ **STEP 3: That's It!** (Done!)

**You're all set!** 🎉

### What happens now:

**Every time you push to main:**
```bash
git push origin main
```

**Automatic deployment happens:**
1. ✅ GitHub detects the push
2. ✅ GitHub Actions triggers Render deploy
3. ✅ Render builds and deploys (~5 min)
4. ✅ Your app goes live automatically!

**No manual work needed!** ✨

---

## 🧪 **Test It Right Now:**

The workflow file was just pushed, so let's trigger a deployment:

1. **Go to GitHub Actions:**
   👉 https://github.com/madhan77/Claude-and-Cursor-Project/actions

2. **You should see:**
   - A workflow run called "Add automated deployment workflow..."
   - Status: ⏳ Running or ❌ Failed (if secret not added yet)

3. **If it says failed:**
   - That's OK! It's because you haven't added the secret yet
   - Add the secret (Step 2 above)
   - Then make any small change and push again

4. **After adding the secret:**
   ```bash
   # Make a tiny change
   echo "# Automation is working!" >> airline-reservation-system/README.md

   # Commit and push
   git add airline-reservation-system/README.md
   git commit -m "Test automated deployment"
   git push origin main

   # Watch it auto-deploy! 🚀
   ```

5. **Monitor Progress:**
   - GitHub Actions: https://github.com/madhan77/Claude-and-Cursor-Project/actions
   - Render Dashboard: https://dashboard.render.com/

---

## 📊 **What You'll See:**

### In GitHub Actions:
```
✅ Deploy Airline Backend to Render
   ✅ Checkout code
   ✅ Trigger Render Deploy Hook
   ✅ Deployment Summary

   🚀 Deployment triggered successfully!
```

### In Render Dashboard:
```
⏳ Deploying...
   Building application
   Running npm install
   Running npm run build
   Starting server
   Health check passed
✅ Live
```

### In About 5-7 Minutes:
```bash
# Your app is live with the latest code!
curl https://airline-backend-nlsk.onrender.com/health
# {"success":true,"message":"Airline Reservation API is running"}
```

---

## 🎊 **Benefits:**

**Before:**
- ❌ Manual deploy every time
- ❌ Easy to forget
- ❌ Multiple steps

**Now:**
- ✅ Automatic deployment
- ✅ Just push to main
- ✅ Always in sync

---

## 📞 **Need Help?**

**If GitHub Actions fails:**
- Check the secret name is EXACTLY: `RENDER_DEPLOY_HOOK_URL`
- Verify you copied the full deploy hook URL from Render
- Re-add the secret if needed

**If Render doesn't deploy:**
- Check Render service is active (not paused)
- Verify deploy hook is enabled in Render settings
- Try manual deploy once to "wake up" the service

---

## ✅ **Quick Checklist:**

- [ ] Copied deploy hook URL from Render
- [ ] Added `RENDER_DEPLOY_HOOK_URL` secret to GitHub
- [ ] Pushed a commit to main
- [ ] Saw workflow run in GitHub Actions
- [ ] Saw deployment start in Render
- [ ] Tested the deployed app

---

**Complete these 3 steps and you're done!**

After that, every push to `main` = automatic deployment! 🚀
