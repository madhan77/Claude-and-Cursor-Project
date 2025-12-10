# Database Setup Guide for JetStream on Render

## Problem
Your check-in feature (and all booking features) are returning 400 errors because there's no database configured. The backend can start without a database, but it cannot store or retrieve any data.

## Solution
Set up a PostgreSQL database on Render and connect it to your backend service.

---

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** (top right corner)
3. **Select "PostgreSQL"**
4. Fill in the details:
   - **Name**: `jetstream-airline-db` (or any name you prefer)
   - **Database**: `airline_reservation` (this will be your database name)
   - **User**: `airline_user` (or leave default)
   - **Region**: Same region as your backend service (for better performance)
   - **PostgreSQL Version**: 16 (latest)
   - **Plan**: Free (for testing)
5. **Click "Create Database"**

⏰ **Wait 2-3 minutes** for the database to be provisioned.

---

## Step 2: Get Database Connection String

1. Once created, click on your new database
2. Scroll down to **"Connections"** section
3. Copy the **"Internal Database URL"** (starts with `postgres://`)
   - Internal URL is faster since it's within Render's network
   - Format: `postgres://user:password@hostname/database`

---

## Step 3: Connect Database to Backend Service

1. Go back to your **backend service** in Render dashboard
2. Click on your backend service: `airline-backend`
3. Go to **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"**
5. Add the database URL:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL you copied
6. **Click "Save Changes"**

🔄 This will trigger an automatic deployment of your backend.

---

## Step 4: Verify Database Connection

After the backend redeploys (takes 2-3 minutes):

1. **Check backend logs** in Render:
   - Click on your backend service
   - Go to "Logs" tab
   - Look for: `✅ Auto-migration completed successfully`
   - This confirms the database schema was created

2. **Test the API**:
```bash
# Check if airports are loaded (means database is working)
curl -s https://airline-backend-nlsk.onrender.com/api/v1/flights/airports | jq '.'
```

Expected: You should see an array of airports (may be empty initially, that's okay)

---

## Step 5: Enable Auto-Seeding (Recommended)

To automatically populate your database with sample data:

1. Go to your **backend service** in Render
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add the auto-seed flag:
   - **Key**: `AUTO_SEED`
   - **Value**: `true`
5. **Click "Save Changes"**

🔄 This triggers a redeploy. The backend will automatically seed the database if it's empty.

**What gets seeded:**
- 10 Airlines (AA, UA, DL, BA, LH, AF, EK, QR, SQ, JL)
- 15 Airports (JFK, LAX, ORD, LHR, SFO, NRT, etc.)
- 6 Aircraft types (Boeing 737, A320, 777, A350, 787, A380)
- 10 Sample flights (departing tomorrow)
- Seat maps for all flights

**Note**: The seed only runs once when the database is empty. On subsequent deploys, it will skip seeding if data already exists.

### Alternative: Create Booking Through Frontend

Once flights are seeded, you can also:
1. Go to https://airline-frontend-5rqq.onrender.com/
2. Search for flights
3. Make a test booking
4. Use that booking for check-in

---

## Step 6: Test Check-In Feature

After database is set up and seeded:

### 1. Create a Test Booking First

**Important**: The auto-seed creates flights but NOT bookings. You need to create a booking first:

1. Visit: https://airline-frontend-5rqq.onrender.com/
2. Search for flights:
   - From: **JFK** (New York)
   - To: **LAX** (Los Angeles)
   - Date: **Tomorrow**
   - Passengers: 1 Adult
   - Class: Economy
3. Click "Search Flights"
4. Select a flight and click "Book Now"
5. Fill in passenger details (any test data)
6. Complete booking
7. **Note down the PNR** (e.g., `ABC123`) shown in the confirmation

### 2. Check In with Your Booking

1. Visit: https://airline-frontend-5rqq.onrender.com/checkin
2. Enter the PNR you noted
3. Click "Look Up Booking"
4. You should see passenger details
5. Click "Check In" for the passenger

### 3. Expected Result

- ✅ Success: "Check-in successful!"
- ✅ Boarding pass generated with seat assignment
- ✅ Can download/view boarding pass

---

## Troubleshooting

### "Booking not found" Error
- Database is empty - run the seed script (Step 5)
- Or create a booking through the frontend

### "Check-in window not open" Error
- Sample flights may be in the past
- Update flight dates to be within 24 hours from now
- Or create a new booking with a flight departing tomorrow

### "Database connection error"
- Verify DATABASE_URL is set correctly in Environment Variables
- Check database is running (not suspended) in Render dashboard
- Verify backend redeployed after adding DATABASE_URL

### 500 Server Error
- Check backend logs for specific error
- Most common: DATABASE_URL not set or incorrect

---

## Quick Verification Checklist

- [ ] PostgreSQL database created on Render
- [ ] DATABASE_URL environment variable added to backend
- [ ] Backend redeployed successfully
- [ ] Backend logs show "Auto-migration completed successfully"
- [ ] Can access `/api/v1/flights/airports` endpoint
- [ ] Sample data seeded (if using Option B)
- [ ] Can find bookings via API or create new ones
- [ ] Check-in feature works with valid PNR

---

## What Happens After Setup

Once database is configured:

1. **All features will work**:
   - Flight search
   - Bookings
   - User registration/login
   - Check-in
   - Boarding passes

2. **Data persists**:
   - Bookings won't be lost on redeploy
   - Users can register and login
   - Check-ins are saved

3. **Automatic migrations**:
   - Every deployment runs auto-migration
   - Database schema stays up to date
   - No manual SQL needed

---

## Next Steps After Database Setup

1. **Test the complete booking flow**:
   - Search flights → Book → Check-in → View boarding pass

2. **Test user registration**:
   - Create account → Login → View "My Bookings"

3. **Monitor database usage**:
   - Free tier: 1 GB storage, 97 hours/month uptime
   - Upgrade if you need 24/7 uptime

---

Need help? Check the backend logs in Render for detailed error messages.
