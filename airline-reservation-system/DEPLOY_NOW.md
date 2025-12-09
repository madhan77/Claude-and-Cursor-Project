# 🚀 Deploy NOW - Quick Reference

## ⚡ Fastest Way to Deploy

```bash
cd airline-reservation-system
./deploy-to-render.sh
```

---

## 🔧 First Time Setup (2 minutes)

### **Step 1: Get Render Deploy Hook**
1. Go to: https://dashboard.render.com/
2. Click: `airline-backend-nlsk`
3. Click: **Settings** → **Deploy Hook**
4. Click: **Copy**

### **Step 2: Save Deploy Hook**
```bash
git config render.deployhook 'PASTE_YOUR_DEPLOY_HOOK_URL_HERE'
```

### **Step 3: Update Render Build Settings**
In Render Dashboard → Settings:

**Build Command:**
```bash
rm -rf dist && npm install --production=false && npm run build
```

**Root Directory:**
```
airline-reservation-system/backend
```

**Start Command:**
```bash
npm start
```

Click **Save Changes**

---

## 🎯 Deploy Now

```bash
cd /Users/madhanbaskaran/Documents/Claude\ and\ Cursor\ Project/airline-reservation-system
./deploy-to-render.sh
```

**What it does:**
1. ✅ Commits your changes
2. ✅ Pushes to GitHub
3. ✅ Triggers Render deployment
4. ⏰ Waits ~5-7 minutes
5. ✅ Your code is LIVE!

---

## 🧪 Test After Deployment

```bash
./test-deployment.sh
```

**Expected output (detailed errors, not generic 500):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

OR

```json
{
  "success": false,
  "message": "Database query failed",
  "error": "relation 'bookings' does not exist"
}
```

---

## 📊 Monitor Deployment

- **Render**: https://dashboard.render.com/
- **GitHub Actions**: https://github.com/madhan77/Claude-and-Cursor-Project/actions

---

## 🎊 You're All Set!

**From now on, just run:**
```bash
./deploy-to-render.sh
```

**Or push to main and it deploys automatically!**

---

For full details, see: `AUTOMATED_DEPLOY_SETUP.md`
