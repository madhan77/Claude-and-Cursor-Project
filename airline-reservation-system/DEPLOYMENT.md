# Deployment Guide - Airline Reservation System

This guide covers deploying the Airline Reservation System to production using modern cloud platforms.

## 🎯 Deployment Options

We'll cover three deployment strategies:

1. **Quick Deploy** (Recommended for MVP): Railway + Vercel (~15 minutes)
2. **Alternative**: Render + Vercel (~20 minutes)
3. **Advanced**: Docker + AWS/DigitalOcean (~30 minutes)

---

## ✅ Option 1: Railway + Vercel (Recommended)

**Best for:** Quick deployment, startups, MVPs
**Cost:** Free tier available, then ~$5-20/month
**Time:** ~15 minutes

### Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)

### Step 1: Deploy Database & Backend to Railway

#### 1.1 Create Railway Account
```bash
# Visit https://railway.app and sign up with GitHub
```

#### 1.2 Install Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
```

#### 1.3 Deploy via Railway Dashboard

**Option A: Using Railway Dashboard (Easier)**

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the backend

**Configure Environment Variables:**
```env
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (Railway will auto-provide PostgreSQL)
DATABASE_URL=${DATABASE_URL}

# JWT Secrets (Generate new ones!)
JWT_SECRET=YOUR_PRODUCTION_SECRET_HERE_CHANGE_ME
JWT_REFRESH_SECRET=YOUR_PRODUCTION_REFRESH_SECRET_HERE

# Frontend URL (Will be your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.up.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Option B: Using Railway CLI**

```bash
cd airline-reservation-system/backend

# Login to Railway
railway login

# Create new project
railway init

# Add PostgreSQL database
railway add --plugin postgresql

# Link to your project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_production_secret_change_me
railway variables set JWT_REFRESH_SECRET=your_refresh_secret_change_me

# Deploy
railway up

# Run database migration
railway run npm run migrate
railway run npm run seed
```

#### 1.4 Get Database URL
```bash
# Get PostgreSQL connection string
railway variables

# Copy DATABASE_URL value
```

#### 1.5 Run Database Setup

**Option 1: Using Railway CLI**
```bash
# Connect to Railway PostgreSQL
railway connect postgres

# In psql, run the schema
\i src/database/schema.sql
\q

# Or run seed from Railway
railway run npm run seed
```

**Option 2: Using Railway Web Terminal**
1. Go to your Railway project
2. Click on PostgreSQL plugin
3. Click "Connect"
4. Run the schema.sql content

### Step 2: Deploy Frontend to Vercel

#### 2.1 Prepare Frontend for Deployment

First, update the frontend to use the Railway backend URL:

```bash
cd airline-reservation-system/frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://your-backend.up.railway.app/api/v1
EOF
```

#### 2.2 Deploy to Vercel

**Option A: Using Vercel Dashboard (Easier)**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `airline-reservation-system/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.up.railway.app/api/v1`

6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? airline-reservation-frontend
# - Directory? ./
# - Override settings? No

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend.up.railway.app/api/v1

# Deploy to production
vercel --prod
```

#### 2.3 Update Backend CORS

Update your backend environment variables on Railway:
```env
FRONTEND_URL=https://your-app.vercel.app
```

### Step 3: Verify Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```

2. **Test Frontend:**
   - Visit `https://your-app.vercel.app`
   - Search for flights
   - Register an account
   - Make a test booking

3. **Test Full Integration:**
   - Complete a booking flow
   - Check database for booking record

---

## ✅ Option 2: Render + Vercel

**Best for:** Alternative to Railway, similar ease of use
**Cost:** Free tier available
**Time:** ~20 minutes

### Step 1: Deploy to Render

#### 1.1 Create Render Account
Visit https://render.com and sign up

#### 1.2 Create PostgreSQL Database

1. Click "New" → "PostgreSQL"
2. Name: `airline-reservation-db`
3. Database: `airline_reservation`
4. User: `airline_user`
5. Region: Choose closest to your users
6. Plan: Free tier or Starter
7. Click "Create Database"

8. **Save these credentials:**
   - Internal Database URL
   - External Database URL (for migrations)

#### 1.3 Run Database Schema

```bash
# Using the External Database URL from Render
psql "your-external-database-url-from-render" -f backend/src/database/schema.sql

# Seed data
# First, update backend/.env with Render database URL
DATABASE_URL=your-internal-database-url

# Then run seed (you'll need to do this locally or via Render shell)
```

#### 1.4 Create Web Service for Backend

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `airline-reservation-backend`
   - **Region:** Same as database
   - **Branch:** `main` or your deployment branch
   - **Root Directory:** `airline-reservation-system/backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free or Starter

4. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
   JWT_SECRET=your_production_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. Click "Create Web Service"

#### 1.5 Seed Database

Once deployed, use Render Shell:
1. Go to your web service
2. Click "Shell" tab
3. Run:
   ```bash
   npm run seed
   ```

### Step 2: Deploy Frontend to Vercel

Same as Option 1, Step 2 - but use your Render backend URL:
```env
VITE_API_URL=https://airline-reservation-backend.onrender.com/api/v1
```

---

## ✅ Option 3: Docker Deployment

**Best for:** Self-hosting, AWS, DigitalOcean, full control
**Time:** ~30 minutes

### Docker Configuration Files

See the Docker files created below:
- `docker-compose.yml` - Full stack deployment
- `backend/Dockerfile` - Backend container
- `frontend/Dockerfile` - Frontend container

### Deploy to DigitalOcean

#### 1. Create Droplet
```bash
# Create Ubuntu droplet (Minimum: 2GB RAM, 1 CPU)
# Enable Docker during creation
```

#### 2. Connect and Deploy
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Clone repository
git clone https://github.com/your-username/your-repo.git
cd airline-reservation-system

# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Deploy with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run seed
```

#### 3. Configure Nginx (Reverse Proxy)
```bash
# Install Nginx
apt update && apt install -y nginx

# Configure Nginx (see nginx.conf below)
```

### Deploy to AWS EC2

Similar to DigitalOcean but using EC2 instance.

```bash
# Launch EC2 instance (t2.small or larger)
# Security Group: Allow ports 80, 443, 5000, 3000

# SSH into instance
ssh -i your-key.pem ubuntu@ec2-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy (same as DigitalOcean)
```

---

## 🔐 Security Checklist for Production

Before going live, ensure:

- [ ] Change all default passwords and secrets
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS to allow only your frontend domain
- [ ] Enable HTTPS (use Cloudflare or Let's Encrypt)
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Review and minimize exposed environment variables
- [ ] Enable database SSL connections
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure production logging
- [ ] Remove seed data if contains test info
- [ ] Set up firewall rules

---

## 📊 Post-Deployment Checklist

### Immediate Tasks
- [ ] Verify all API endpoints work
- [ ] Test complete booking flow
- [ ] Verify email notifications (if enabled)
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Test from different devices
- [ ] Verify CORS settings

### Within 24 Hours
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Test disaster recovery
- [ ] Document deployed URLs
- [ ] Share with stakeholders
- [ ] Monitor performance metrics

### Within 1 Week
- [ ] Analyze user behavior
- [ ] Check for errors in production
- [ ] Optimize slow queries
- [ ] Plan next features
- [ ] Gather user feedback

---

## 🔧 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=minimum-32-characters-random-string
JWT_REFRESH_SECRET=different-32-characters-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
```

---

## 🚨 Troubleshooting Deployment Issues

### Backend Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Test connection
psql "your-database-url"
```

**Build Fails**
```bash
# Check Node version (should be 18+)
node --version

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**CORS Errors**
```bash
# Ensure FRONTEND_URL matches exactly (no trailing slash)
# Check CORS configuration in server.ts
```

### Frontend Issues

**API Calls Fail**
```bash
# Check VITE_API_URL in environment variables
# Ensure it includes /api/v1
# Check browser console for CORS errors
```

**Build Fails**
```bash
# Check all dependencies are installed
npm install

# Check TypeScript errors
npm run build
```

### Database Issues

**Schema Not Applied**
```bash
# Re-run schema
psql "database-url" -f backend/src/database/schema.sql
```

**Seed Data Not Loading**
```bash
# Run seed script
npm run seed

# Or manually via psql
```

---

## 📈 Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- CPU usage > 70%
- Memory usage > 80%
- Database connections maxed out
- More than 1000 daily active users

### How to Scale

**Horizontal Scaling:**
- Add more backend instances (Railway/Render auto-scale)
- Use load balancer (Nginx, CloudFlare)
- Implement Redis caching
- Use CDN for frontend assets

**Database Scaling:**
- Upgrade to larger instance
- Add read replicas
- Implement connection pooling (PgBouncer)
- Add database caching (Redis)

**Optimization:**
- Enable gzip compression
- Optimize database queries
- Add database indexes
- Implement API caching
- Use lazy loading on frontend

---

## 💰 Cost Estimates

### Railway + Vercel (Recommended)
- **Free Tier:** $0/month (limited usage)
- **Hobby:** ~$5/month (Railway) + $0 (Vercel)
- **Pro:** ~$20/month (Railway) + $20 (Vercel)

### Render + Vercel
- **Free Tier:** $0/month (limited)
- **Starter:** ~$7/month (Render DB) + $0 (Vercel)
- **Standard:** ~$15/month (Render) + $20 (Vercel)

### Self-Hosted (DigitalOcean/AWS)
- **Basic:** $12/month (2GB Droplet)
- **Standard:** $24/month (4GB Droplet)
- **Production:** $50+/month (8GB+ Droplet, managed DB)

---

## 🎯 Recommended: Railway + Vercel

For your MVP, I recommend **Railway + Vercel** because:
- ✅ Fastest deployment (~15 minutes)
- ✅ Free tier available
- ✅ Auto-scaling built-in
- ✅ Easy database management
- ✅ GitHub integration
- ✅ Auto-deploy on push
- ✅ Great developer experience

---

## 📞 Need Help?

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check deployment logs
4. Verify environment variables

---

**Ready to deploy? Choose your platform and follow the steps above!** 🚀
