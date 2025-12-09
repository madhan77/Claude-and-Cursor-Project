#!/bin/bash

# Firebase Deployment Script for Airline Reservation System
# This deploys frontend to Firebase Hosting and guides backend deployment to Railway

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🛫 Airline Reservation System                          ║"
echo "║      Firebase + Railway Deployment                        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Steps:${NC}"
echo ""
echo "  Step 1: Deploy Backend to Railway"
echo "  Step 2: Deploy Frontend to Firebase Hosting"
echo "  Step 3: Configure Environment Variables"
echo "  Step 4: Test Application"
echo ""

# ============================================================
# STEP 1: Backend Deployment (Railway)
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Deploy Backend to Railway${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✓${NC} Railway CLI ready"
echo ""

# Check Railway login
echo "Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
else
    echo -e "${GREEN}✓${NC} Already logged into Railway"
fi
echo ""

# Deploy backend
echo -e "${BLUE}Deploying backend to Railway...${NC}"
cd backend

# Check if already linked to Railway project
if [ ! -f ".railway" ]; then
    echo ""
    echo -e "${YELLOW}Setting up new Railway project...${NC}"
    railway init
fi

echo ""
echo -e "${BLUE}Deploying backend code...${NC}"
railway up

echo ""
echo -e "${GREEN}✓${NC} Backend deployed to Railway!"
echo ""

# Get Railway URL
echo -e "${BLUE}Getting your backend URL...${NC}"
RAILWAY_URL=$(railway status --json 2>/dev/null | grep -o '"url":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect Railway URL${NC}"
    echo ""
    echo "Please:"
    echo "  1. Go to your Railway dashboard"
    echo "  2. Copy your backend URL"
    echo "  3. It will look like: https://your-app.up.railway.app"
    echo ""
    read -p "Enter your Railway backend URL: " RAILWAY_URL
fi

echo -e "${GREEN}✓${NC} Backend URL: ${RAILWAY_URL}"
echo ""

# Set environment variables on Railway
echo -e "${BLUE}Setting up environment variables...${NC}"
echo ""
echo "Generating JWT secrets..."

JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

echo -e "${GREEN}✓${NC} JWT secrets generated"
echo ""

# Add PostgreSQL if not present
echo "Checking for PostgreSQL database..."
if ! railway variables | grep -q "DATABASE_URL"; then
    echo -e "${YELLOW}Adding PostgreSQL database...${NC}"
    railway add --plugin postgresql
    echo -e "${GREEN}✓${NC} PostgreSQL added"
else
    echo -e "${GREEN}✓${NC} PostgreSQL already configured"
fi
echo ""

# Set variables
echo "Setting environment variables on Railway..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="${JWT_SECRET}"
railway variables set JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"
railway variables set FRONTEND_URL="https://your-project.web.app"

echo -e "${GREEN}✓${NC} Environment variables set"
echo ""

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
railway run npm run migrate

echo ""
echo -e "${BLUE}Seeding database with sample data...${NC}"
railway run npm run seed

echo ""
echo -e "${GREEN}✅ Backend deployment complete!${NC}"
echo ""

cd ..

# ============================================================
# STEP 2: Frontend Deployment (Firebase)
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Deploy Frontend to Firebase Hosting${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

echo -e "${GREEN}✓${NC} Firebase CLI ready"
echo ""

# Login to Firebase
echo "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}Please login to Firebase:${NC}"
    firebase login
else
    echo -e "${GREEN}✓${NC} Already logged into Firebase"
fi
echo ""

# Initialize Firebase if needed
if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}Initializing Firebase...${NC}"
    firebase init hosting
fi

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
cd frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=${RAILWAY_URL}/api/v1
EOF

echo -e "${GREEN}✓${NC} Environment file created"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Building production bundle..."
npm run build

echo ""
echo -e "${GREEN}✓${NC} Frontend built successfully"
echo ""

cd ..

# Deploy to Firebase
echo -e "${BLUE}Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting

echo ""
echo -e "${GREEN}✅ Frontend deployment complete!${NC}"
echo ""

# Get Firebase URL
FIREBASE_URL=$(firebase hosting:channel:list 2>/dev/null | grep "live" | awk '{print $3}' || echo "")

if [ -z "$FIREBASE_URL" ]; then
    echo "Please get your Firebase URL from the Firebase console"
    read -p "Enter your Firebase URL (e.g., https://your-app.web.app): " FIREBASE_URL
fi

# ============================================================
# STEP 3: Update Backend CORS
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Update Backend CORS Configuration${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd backend
echo "Updating FRONTEND_URL to ${FIREBASE_URL}..."
railway variables set FRONTEND_URL="${FIREBASE_URL}"

echo ""
echo -e "${GREEN}✓${NC} CORS configured"
echo ""

cd ..

# ============================================================
# STEP 4: Deployment Summary
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create deployment summary
cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary - Airline Reservation System

**Deployment Date:** $(date)

## 🌐 Live URLs

- **Frontend (Firebase):** ${FIREBASE_URL}
- **Backend API (Railway):** ${RAILWAY_URL}
- **Health Check:** ${RAILWAY_URL}/health

## 🔑 Configuration

### Backend (Railway)
- Node.js + Express + PostgreSQL
- JWT Authentication enabled
- Database seeded with sample data
- Environment: Production

### Frontend (Firebase Hosting)
- Built with Vite + React + TypeScript
- Deployed to Firebase CDN
- API URL configured: ${RAILWAY_URL}/api/v1

## 🧪 Testing Checklist

- [ ] Visit ${FIREBASE_URL}
- [ ] Search flights (JFK → LAX)
- [ ] Register new account
- [ ] Login with credentials
- [ ] Create a booking
- [ ] View "My Bookings"
- [ ] Cancel a booking

## 📊 Sample Test Data

### Routes Available:
- JFK → LAX (New York to Los Angeles) - \$299
- JFK → LHR (New York to London) - \$599
- SFO → NRT (San Francisco to Tokyo) - \$899
- ORD → MIA (Chicago to Miami) - \$199
- BOS → LAX (Boston to Los Angeles) - \$319

### Airlines:
- American Airlines (AA)
- United Airlines (UA)
- Delta Air Lines (DL)
- British Airways (BA)
- Emirates (EK)
- And more...

## 🔧 Management

### View Backend Logs:
\`\`\`bash
cd backend
railway logs
\`\`\`

### View Firebase Logs:
\`\`\`bash
firebase hosting:channel:list
\`\`\`

### Redeploy Backend:
\`\`\`bash
cd backend
railway up
\`\`\`

### Redeploy Frontend:
\`\`\`bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
\`\`\`

## 📞 Support

If you encounter issues:
1. Check backend health: ${RAILWAY_URL}/health
2. Review Railway logs: \`railway logs\`
3. Check Firebase console for hosting status
4. Verify environment variables are set

## 🎯 Next Steps

1. Test the application thoroughly
2. Add custom domain (optional)
3. Set up monitoring
4. Share with stakeholders
5. Gather user feedback

---

**Status:** ✅ Ready for Review
**Last Updated:** $(date)
EOF

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   ✅ Your Airline Reservation System is LIVE!            ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} ${FIREBASE_URL}"
echo -e "${BLUE}🔧 Backend:${NC}  ${RAILWAY_URL}"
echo -e "${BLUE}🏥 Health:${NC}   ${RAILWAY_URL}/health"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "  1. Test your application:"
echo "     ${FIREBASE_URL}"
echo ""
echo "  2. Check backend health:"
echo "     curl ${RAILWAY_URL}/health"
echo ""
echo "  3. Review deployment summary:"
echo "     cat DEPLOYMENT_SUMMARY.md"
echo ""
echo "  4. Monitor logs:"
echo "     railway logs (for backend)"
echo ""
echo -e "${GREEN}🎉 Happy Flying!${NC}"
echo ""
