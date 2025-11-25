# Manufacturing Tracking System - Setup Guide

This guide will walk you through setting up the Manufacturing Tracking System from scratch.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Running the Application](#running-the-application)
7. [Seeding Sample Data](#seeding-sample-data)
8. [Troubleshooting](#troubleshooting)

---

## 1. System Requirements

### Minimum Requirements:
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 10 GB free space
- **OS:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Software Requirements:
- Node.js v18+ (LTS recommended)
- PostgreSQL 14+
- Redis 7+ (optional but recommended)
- Git

---

## 2. Installing Prerequisites

### 2.1 Node.js Installation

**Windows/macOS:**
- Download from [nodejs.org](https://nodejs.org/)
- Run the installer
- Verify installation:
```bash
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 PostgreSQL Installation

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer (remember the password you set for postgres user)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3 Redis Installation (Optional)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
- Use WSL2 or download from [Redis on Windows](https://github.com/microsoftarchive/redis/releases)

---

## 3. Database Setup

### 3.1 Create Database

**Method 1: Using psql command line**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE manufacturing_tracking;

# Create user (optional)
CREATE USER mfg_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE manufacturing_tracking TO mfg_user;

# Exit
\q
```

**Method 2: Using pgAdmin**

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Enter "manufacturing_tracking" as the database name
5. Click "Save"

### 3.2 Verify Database Connection

```bash
psql -U postgres -d manufacturing_tracking -c "SELECT version();"
```

---

## 4. Backend Configuration

### 4.1 Navigate to Backend Directory

```bash
cd manufacturing-tracking-system/backend
```

### 4.2 Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express
- sequelize
- pg (PostgreSQL client)
- jsonwebtoken
- bcryptjs
- and more...

### 4.3 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manufacturing_tracking
DB_USER=postgres
DB_PASSWORD=your_postgres_password  # CHANGE THIS!

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production  # CHANGE THIS!
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

**Important Security Notes:**
- Change `JWT_SECRET` to a long random string
- Change `DB_PASSWORD` to your actual PostgreSQL password
- Never commit `.env` file to version control

### 4.4 Generate Secure JWT Secret

```bash
# Generate a random 64-character string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

---

## 5. Frontend Configuration

### 5.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

### 5.2 Install Dependencies

```bash
npm install
```

This will install:
- React and React DOM
- Material-UI components
- Axios for API calls
- React Router for navigation
- React Query for data fetching
- and more...

### 5.3 Verify Vite Configuration

The `vite.config.ts` is already configured to proxy API requests to the backend.

No additional configuration needed for development.

---

## 6. Running the Application

### 6.1 Start Backend Server

Open a terminal in the `backend` directory:

```bash
# Development mode (auto-reload on changes)
npm run dev
```

You should see:
```
=================================
🚀 Server running on port 5000
📝 Environment: development
🔗 API Base URL: http://localhost:5000/api/v1
=================================
✅ Database connection established successfully.
✅ Database synchronized.
```

### 6.2 Start Frontend Development Server

Open a **new terminal** in the `frontend` directory:

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 6.3 Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the login page.

---

## 7. Seeding Sample Data

To populate the database with sample data for testing:

### 7.1 Run Seed Script

In the `backend` directory:

```bash
npm run seed
```

Or if the script is not in package.json:

```bash
npx ts-node src/utils/seed.ts
```

This will create:
- ✅ 5 sample users (admin, manager, supervisor, operator, quality inspector)
- ✅ 5 sample products (cars, phones, laptops, engines)
- ✅ 5 sample materials (steel, paint, tires, PCBs, batteries)
- ✅ 5 sample equipment (presses, welders, paint booths, SMT lines)
- ✅ 6 sample production orders (various statuses)

### 7.2 Default Login Credentials

After seeding, you can login with:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Administrator |
| manager | password123 | Manager |
| supervisor | password123 | Supervisor |
| operator1 | password123 | Operator |
| quality1 | password123 | Quality Inspector |

---

## 8. Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql  # Linux
   brew services list  # macOS
   ```
2. Check database credentials in `.env`
3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

### Problem: "Port 5000 already in use"

**Solution:**
1. Change `PORT` in backend `.env` file
2. Kill process using port 5000:
   ```bash
   # Linux/macOS
   lsof -ti:5000 | xargs kill -9

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Problem: "npm install fails"

**Solution:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Problem: "Redis connection failed"

**Solution:**
- Redis is optional. The app will continue without it.
- To install Redis, see section 2.3
- Or set `REDIS_HOST=` (empty) in `.env` to disable

### Problem: Frontend shows "Network Error"

**Solution:**
1. Verify backend is running on port 5000
2. Check CORS settings in backend `.env`
3. Open browser DevTools (F12) and check Console for errors

### Problem: "Module not found" errors

**Solution:**
1. Ensure you're in the correct directory (backend or frontend)
2. Run `npm install` again
3. Check for TypeScript errors: `npm run build`

---

## 🎉 Next Steps

Once the application is running:

1. **Explore the Dashboard** - View production statistics
2. **Create Production Orders** - Navigate to Production Orders page
3. **Manage Users** - Add team members with different roles
4. **Configure Products** - Add your products and BOMs
5. **Track Jobs** - Start tracking work-in-progress

For detailed feature documentation, see the [PRD](../MANUFACTURING_UNIT_PRD.md).

---

## 📞 Need Help?

- Check the [README.md](README.md) for API documentation
- Review the [PRD](../MANUFACTURING_UNIT_PRD.md) for system requirements
- Open an issue in the repository for bugs

---

**Happy Manufacturing! 🏭**
