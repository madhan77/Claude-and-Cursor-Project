# Connect Your Existing Database to Backend

You already have a PostgreSQL database in Render! Now just connect it to your backend.

## Quick Steps (2 Minutes)

### Step 1: Get Your Database URL

1. Go to https://dashboard.render.com/
2. Find your database service: `dpg-d4n0usmuk2gs739dgokg-a`
3. Click on it
4. Scroll to **"Connections"** section
5. Copy the **"Internal Database URL"**
   - Should start with: `postgres://airline_db_user:...`
   - Use **Internal** (faster), not External

### Step 2: Add to Backend Environment Variables

1. Go to your **backend service**: `airline-backend`
   - URL: https://dashboard.render.com/ (find "airline-backend" in your services)
2. Click **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Add these TWO variables:

**First Variable:**
- Key: `DATABASE_URL`
- Value: <paste the Internal Database URL you copied>

**Second Variable:**
- Key: `AUTO_SEED`
- Value: `true`

5. Click **"Save Changes"**

🔄 This will trigger an automatic deployment (takes 2-3 minutes)

---

## What Happens Next

1. **Backend redeploys** with the database connection
2. **Auto-migration runs** - Creates all tables automatically
3. **Auto-seed runs** - Populates the database with:
   - 10 Airlines
   - 15 Airports
   - 6 Aircraft types
   - 10 Sample flights (departing tomorrow)
   - Seat maps for all flights

---

## Verify It's Working

After the deployment completes (watch the "Logs" tab):

### Check 1: Look for Success Messages

In the backend logs, you should see:
```
✅ Database schema created successfully!
✅ Auto-seed completed successfully!
```

### Check 2: Test the API

```bash
# Test airports endpoint
curl -s https://airline-backend-nlsk.onrender.com/api/v1/flights/airports | jq '.'
```

Expected: Array of 15 airports

```bash
# Test flight search
curl -s 'https://airline-backend-nlsk.onrender.com/api/v1/flights/search?departure_airport=JFK&arrival_airport=LAX&departure_date=2025-12-10&adults=1' | jq '.'
```

Expected: Array of available flights

---

## Test Check-In

Now create a booking and test check-in:

1. Go to https://airline-frontend-5rqq.onrender.com/
2. Search for flights:
   - From: **JFK**
   - To: **LAX**
   - Date: **Tomorrow** (or any future date)
   - Passengers: 1 Adult
3. Click "Search Flights"
4. Select a flight and click "Book Now"
5. Fill in passenger details (any test data)
6. Complete booking
7. **Note the PNR** (e.g., `ABC123`)
8. Go to **Check-In** page
9. Enter your PNR
10. Click "Check In"

✅ **Should work perfectly now!**

---

## Troubleshooting

### "No flights found"

- Database might not be seeded yet
- Check backend logs for auto-seed success message
- Verify `AUTO_SEED=true` is set

### "Database connection error"

- Verify `DATABASE_URL` is correct (no typos)
- Make sure you copied the **Internal** URL, not External
- Check database is running (not suspended)

### "Booking not found" during check-in

- You need to create a booking first (no sample bookings in seed)
- Follow the "Test Check-In" steps above to create a booking

---

## After Setup

Once connected, you can:
- ✅ Search flights
- ✅ Make bookings
- ✅ Register users
- ✅ Login
- ✅ Check in
- ✅ View boarding passes
- ✅ View "My Bookings"

All features are now fully functional!

---

## Optional: Disable Auto-Seed Later

After the first deployment, you may want to disable auto-seed so it doesn't check on every deploy:

1. Go to backend Environment variables
2. Change `AUTO_SEED` from `true` to `false`
3. Save

The auto-seed is smart - it only seeds if the database is empty, so it's safe to leave enabled.

---

**That's it! Your database is ready to use.**
