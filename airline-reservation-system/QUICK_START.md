# 🚀 Quick Start - Automated Deployment

## One Command Setup

Run this single command to automate everything:

```bash
cd airline-reservation-system && chmod +x scripts/*.sh && ./scripts/setup-automation.sh
```

This will automatically:
- ✅ Connect your existing database (`dpg-d4n0usmuk2gs739dgokg-a`)
- ✅ Set environment variables (DATABASE_URL, AUTO_SEED=true)
- ✅ Configure GitHub Actions for auto-deploy
- ✅ Trigger initial deployment

---

## What You Need

The script will ask for:

1. **Render API Key**
   - Get it: https://dashboard.render.com/u/settings#api-keys
   - Click "Create API Key"
   - Name: "JetStream Deployment"

2. **Backend Service ID**
   - Find it in Render backend URL
   - Format: `srv-xxxxx...`

3. **GitHub Repository**
   - Format: `username/repository`
   - Example: `madhan77/Claude-and-Cursor-Project`

---

## After Setup

Wait 2-3 minutes, then check deployment:

```bash
./scripts/check-deployment.sh
```

Expected output:
```
✅ Backend is running
✅ Database is connected
✅ Sample flights available
✅ Frontend is running
✅ All systems operational!
```

---

## From Now On

Just code and push - deployment is automatic:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically deploys!
# Watch: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

---

## Manual Alternative (If You Prefer)

If you don't want to use the automation script:

1. **Get Database URL** from Render dashboard
2. **Add to Backend** in Render Environment tab:
   - `DATABASE_URL` = <your database URL>
   - `AUTO_SEED` = `true`
3. **Add GitHub Secret**:
   ```bash
   echo "YOUR_DEPLOY_HOOK_URL" | gh secret set RENDER_DEPLOY_HOOK_URL
   ```

---

## Need More Details?

- Full automation guide: `AUTOMATED_DEPLOYMENT.md`
- Database setup: `CONNECT_EXISTING_DATABASE.md`
- Check-in error fix: `FIX_CHECKIN_ERROR.md`

---

**Happy deploying!** 🎉
