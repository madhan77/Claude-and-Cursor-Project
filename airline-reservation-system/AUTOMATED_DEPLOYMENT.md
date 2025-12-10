# 🚀 Automated Deployment Setup

**One command to set up everything!**

This guide shows you how to automate your entire deployment process so that:
- ✅ Database is automatically connected
- ✅ Environment variables are automatically set
- ✅ Deployments happen automatically when you push code
- ✅ No manual steps needed in Render dashboard

---

## 🎯 Quick Start (One Command)

```bash
cd airline-reservation-system
chmod +x scripts/*.sh
./scripts/setup-automation.sh
```

That's it! The script will:
1. Connect your database to the backend
2. Set up environment variables (DATABASE_URL, AUTO_SEED)
3. Configure GitHub Actions for auto-deployment
4. Trigger initial deployment

---

## 📋 Prerequisites

### 1. Install GitHub CLI

**Mac:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Windows:**
```bash
winget install GitHub.cli
```

### 2. Install jq (Optional, but recommended)

**Mac:**
```bash
brew install jq
```

**Linux:**
```bash
sudo apt-get install jq
```

### 3. Get Your Render API Key

1. Go to https://dashboard.render.com/u/settings#api-keys
2. Click "Create API Key"
3. Name it: "JetStream Deployment"
4. Copy the key (you'll need it for the script)

### 4. Get Your Service IDs

**Backend Service ID:**
1. Go to your backend service in Render
2. Look at the URL: `https://dashboard.render.com/web/srv-XXXXX...`
3. Copy the ID: `srv-XXXXX...`

**Database Service ID:**
- You already have it: `dpg-d4n0usmuk2gs739dgokg-a`

---

## 🚀 Running the Automation Script

```bash
cd airline-reservation-system
./scripts/setup-automation.sh
```

The script will prompt you for:
1. **Render API Key** - Get from https://dashboard.render.com/u/settings#api-keys
2. **Backend Service ID** - Format: `srv-xxxxx...`
3. **Database Service ID** - Default: `dpg-d4n0usmuk2gs739dgokg-a`
4. **GitHub Repository** - Format: `username/repository`

### What the Script Does

```
┌─────────────────────────────────────────┐
│ 1. Fetch database connection URL       │
│    (from Render API)                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. Get/create deploy hook URL          │
│    (from Render API)                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. Set backend environment variables   │
│    - DATABASE_URL                       │
│    - AUTO_SEED=true                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. Set GitHub secret                    │
│    - RENDER_DEPLOY_HOOK_URL             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 5. Trigger initial deployment           │
└─────────────────────────────────────────┘
                  ↓
              ✅ Done!
```

---

## ✅ Verify Deployment

After the script completes, wait 2-3 minutes for deployment, then:

```bash
./scripts/check-deployment.sh
```

This will check:
- ✅ Backend health
- ✅ Database connection
- ✅ Sample flights loaded
- ✅ Frontend status
- ✅ GitHub Actions workflow

### Expected Output:

```
╔════════════════════════════════════════════════════════╗
║   📊 JetStream - Deployment Status                   ║
╚════════════════════════════════════════════════════════╝

🔍 Checking backend...
✅ Backend is running
   Uptime: 123s

🔍 Checking database connection...
✅ Database is connected
   Airports loaded: 15

🔍 Checking sample flights...
✅ Sample flights available
   JFK → LAX flights tomorrow: 2

🔍 Checking frontend...
✅ Frontend is running
   Branding: ✅ JetStream

╔════════════════════════════════════════════════════════╗
║   📋 Summary                                          ║
╚════════════════════════════════════════════════════════╝
✅ All systems operational!
```

---

## 🔄 How Auto-Deployment Works

### Workflow

```
1. You make changes to code
        ↓
2. git add . && git commit -m "message"
        ↓
3. git push origin main
        ↓
4. GitHub Actions detects push
        ↓
5. Workflow triggers Render deploy hook
        ↓
6. Render pulls latest code and deploys
        ↓
7. You receive email notification
        ↓
   ✅ New version is live!
```

### GitHub Actions Workflow

Location: `.github/workflows/deploy-airline-backend.yml`

**Triggers on:**
- Push to `main` branch
- Changes in `airline-reservation-system/backend/**`

**What it does:**
1. Checks out code
2. Calls Render deploy hook
3. Render handles the rest (build, deploy, migrations, seeding)

---

## 📝 Manual Deployment (If Needed)

If you need to deploy manually:

```bash
# Trigger backend deployment
curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=xxxxx"

# Or use the deploy script
./scripts/deploy-to-render.sh
```

---

## 🛠️ Troubleshooting

### Script fails with "GitHub CLI not authenticated"

```bash
gh auth login
```

Follow the prompts to authenticate.

### Script can't find service IDs

Get them manually:
1. Backend: https://dashboard.render.com/ → Click backend → Copy ID from URL
2. Database: `dpg-d4n0usmuk2gs739dgokg-a` (you already have this)

### Database URL not set

Run the script again, or set manually:
```bash
curl -X PUT "https://api.render.com/v1/services/YOUR_SERVICE_ID/env-vars" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[{"key":"DATABASE_URL","value":"YOUR_DATABASE_URL"}]'
```

### Deployment not triggered after push

Check GitHub secret:
```bash
gh secret list
```

Should show: `RENDER_DEPLOY_HOOK_URL`

If missing:
```bash
echo "YOUR_DEPLOY_HOOK_URL" | gh secret set RENDER_DEPLOY_HOOK_URL
```

---

## 📊 Monitoring

### Check deployment status
```bash
./scripts/check-deployment.sh
```

### View GitHub Actions runs
```bash
gh run list --workflow=deploy-airline-backend.yml
```

### View latest deployment logs
```bash
gh run view --log
```

### Watch real-time deployment
1. Go to https://dashboard.render.com/
2. Click on backend service
3. Click "Logs" tab

---

## 🎯 What's Automated

| Task | Before | After |
|------|--------|-------|
| Database connection | Manual in Render dashboard | ✅ Automated via API |
| Environment variables | Manual setup | ✅ Automated via API |
| GitHub secrets | Manual setup | ✅ Automated via CLI |
| Deployment trigger | Manual button click | ✅ Auto on git push |
| Database migration | Manual script run | ✅ Auto on deploy |
| Data seeding | Manual script run | ✅ Auto on deploy |

---

## 🔐 Security Notes

- **API Key**: Store securely, never commit to git
- **Database URL**: Only stored in Render, never in git
- **Deploy Hook**: Secret in GitHub, not visible in code

---

## 📚 Additional Scripts

### Test deployment endpoint
```bash
curl https://airline-backend-nlsk.onrender.com/health
```

### Check sample data
```bash
curl https://airline-backend-nlsk.onrender.com/api/v1/flights/airports | jq '.'
```

### Search flights
```bash
TOMORROW=$(date -v+1d +%Y-%m-%d)
curl "https://airline-backend-nlsk.onrender.com/api/v1/flights/search?departure_airport=JFK&arrival_airport=LAX&departure_date=$TOMORROW&adults=1" | jq '.'
```

---

## 🎉 Success!

Once setup is complete:

1. **Make code changes**
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Watch it deploy automatically**:
   - Check GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
   - Check Render logs: https://dashboard.render.com/
4. **Verify deployment**:
   ```bash
   ./scripts/check-deployment.sh
   ```

**That's it! Fully automated deployment is now active.** 🚀

---

## 🆘 Need Help?

- **Automation issues**: Check `scripts/` folder for script source
- **Deployment fails**: Check Render logs
- **GitHub Actions fails**: Check Actions tab in GitHub
- **Database issues**: Run `./scripts/check-deployment.sh`

---

**Happy deploying with JetStream!** ✈️
