# Fix for Check-In 400 Error

## What's Happening

You're getting a **400 error** when trying to check in because:

1. **Your database is not configured** - There's no DATABASE_URL set in Render
2. **No data exists** - Even if you create a booking, it won't be saved without a database
3. **Check-in needs a booking** - You can't check in without an existing booking

## The Root Cause

```
Check-In Feature
     ↓
Needs a Booking
     ↓
Needs Database
     ↓
❌ DATABASE_URL not set
```

## The Solution (3 Steps)

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `jetstream-airline-db`
   - Database: `airline_reservation`
   - Region: Same as backend
   - Plan: **Free**
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning

### Step 2: Connect Database to Backend

1. Click on your new database
2. Copy the **"Internal Database URL"** (starts with `postgres://`)
3. Go to your **backend service** (`airline-backend`)
4. Click **"Environment"** tab
5. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Paste the Internal Database URL
6. Add another environment variable:
   - Key: `AUTO_SEED`
   - Value: `true`
7. Click **"Save Changes"**

🔄 This will redeploy your backend (takes 2-3 minutes)

### Step 3: Create a Test Booking

After backend finishes deploying:

1. Go to https://airline-frontend-5rqq.onrender.com/
2. Search for flights:
   - From: **JFK**
   - To: **LAX**
   - Date: **Tomorrow**
3. Book a flight
4. Note down the **PNR** (e.g., `ABC123`)
5. Go to **Check-In** page
6. Enter your PNR
7. Click **"Check In"**

✅ **It should work now!**

---

## What Changed in Your Code

I've added automatic database seeding:

- When you set `AUTO_SEED=true`, the backend will automatically populate:
  - 10 Airlines
  - 15 Airports
  - 6 Aircraft types
  - 10 Sample flights (departing tomorrow)
  - Seat maps for all flights

- The seed only runs **once** when the database is empty
- You don't need to manually run any scripts

---

## Verification Commands

After Step 2, check if database is working:

```bash
# Test database connection
curl -s https://airline-backend-nlsk.onrender.com/api/v1/flights/airports | jq '.'
```

Expected: Array of 15 airports

```bash
# Check flights
curl -s 'https://airline-backend-nlsk.onrender.com/api/v1/flights/search?departure_airport=JFK&arrival_airport=LAX&departure_date=2025-12-10&adults=1' | jq '.'
```

Expected: Array of available flights

---

## Why This Happened

Your backend was designed to work **without** a database initially (for testing). It starts up fine but can't actually store or retrieve data. This is why:

- ✅ Backend deploys successfully
- ✅ Health check endpoint works
- ❌ Any feature requiring data fails with 400/500 errors

Now that you've connected a database, **all features will work**:
- ✅ Flight search
- ✅ Bookings
- ✅ User registration/login
- ✅ Check-in
- ✅ Boarding passes

---

## Need Help?

If you encounter any issues:

1. Check backend logs in Render for error messages
2. Verify DATABASE_URL is set correctly
3. Ensure database is running (not suspended)
4. See full setup guide: `SETUP_DATABASE.md`

---

**Summary**: Set up the database, and everything will work!
