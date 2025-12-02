# Render Deployment Checklist

## Current Issue
Frontend cannot connect to backend - getting 503 Service Unavailable and CORS errors.

## Steps to Fix

### 1. Check Backend Service Status

Go to Render Dashboard → Services → airline-backend

**Look for:**
- ✅ Service status should be "Live" (green)
- ✅ Latest deploy should show "Deploy succeeded"
- ❌ If showing "Deploy failed" or "Build failed", check logs

### 2. Verify Backend URL

**Important:** The actual backend URL might be different from expected!

Expected: `https://airline-backend.onrender.com`
Actual might be: `https://airline-backend-XXXX.onrender.com` (with hash suffix)

**How to find the actual URL:**
1. Go to Render Dashboard → airline-backend service
2. Look at the top of the page for the URL
3. Copy the exact URL

### 3. Update Frontend Environment Variable

If the backend URL has a hash suffix:

1. Go to Render Dashboard → airline-frontend service
2. Click "Environment" tab
3. Find `VITE_API_URL` variable
4. Update it to: `https://airline-backend-XXXX.onrender.com/api/v1` (use actual URL)
5. Click "Save Changes"
6. Trigger manual redeploy of frontend

### 4. Update Backend FRONTEND_URL Variable

1. Go to Render Dashboard → airline-backend service
2. Click "Environment" tab
3. Find `FRONTEND_URL` variable
4. Verify it matches: `https://airline-frontend-5rqq.onrender.com`
5. If different, update and redeploy

### 5. Check Backend Logs

Go to Render Dashboard → airline-backend → Logs

**Look for these success messages:**
```
✅ Database connected successfully
✅ Running auto-migration...
✅ Email service initialized (or warning if not configured)
✅ SMS service not configured (or initialized if configured)
✅ Real-time flight API not configured (or initialized if configured)
🛫 Airline Reservation System API
Server running on: http://localhost:3000
```

**Common Error Messages:**

#### Database Connection Error
```
❌ Database connection failed
```
**Fix:** Check that DATABASE_URL environment variable is set correctly

#### Build Errors
```
error TS2xxx: [TypeScript error]
```
**Fix:** Latest code pushed should have fixed all TypeScript errors. Trigger manual redeploy.

#### Port Binding Error
```
Error: listen EADDRINUSE :::3000
```
**Fix:** Render might have an issue. Try manual redeploy.

#### Missing Dependencies
```
Cannot find module 'twilio'
Cannot find module 'axios'
Cannot find module 'nodemailer'
```
**Fix:** Latest commit should fix this. Clear build cache and redeploy.

### 6. Test Backend Health Endpoint

Once backend shows "Live":

Open in browser: `https://[your-actual-backend-url]/health`

Should return:
```json
{
  "success": true,
  "message": "Airline Reservation API is running",
  "timestamp": "2025-12-02T...",
  "uptime": 123.45
}
```

If this works, backend is running correctly.

### 7. Test API Endpoint

Try: `https://[your-actual-backend-url]/api/v1/flights/airports`

Should return:
```json
{
  "success": true,
  "data": [
    {
      "code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "USA"
    },
    ...
  ]
}
```

If this works, API is running and database is connected.

### 8. Force Fresh Deployment

If backend is stuck or showing old errors:

1. Go to Render Dashboard → airline-backend
2. Click "Manual Deploy" dropdown
3. Select "Clear build cache & deploy"
4. Wait for deployment to complete (5-10 minutes)

### 9. Common Issues & Solutions

#### Issue: Backend stuck on old version
**Solution:** Clear build cache and redeploy

#### Issue: CORS errors persist after CORS fix deployed
**Solution:**
- Verify latest commit (654ac0c or later) is deployed
- Check backend logs for CORS configuration
- Hard refresh frontend (Ctrl+Shift+R or Cmd+Shift+R)

#### Issue: Database connection timing out
**Solution:**
- Verify DATABASE_URL is set in environment variables
- Check that airline-db database is "Available"
- Ensure backend service has access to database

#### Issue: 503 Service Unavailable
**Solution:**
- Backend is not running or health check is failing
- Check logs for startup errors
- Verify all environment variables are set
- Try manual redeploy

#### Issue: Dropdowns still empty after backend is running
**Solution:**
- Check browser console for errors
- Verify frontend VITE_API_URL points to correct backend URL
- Check that auto-migration seeded data (look for "✅ Seeded X airports" in logs)

## Quick Verification Commands

### Check if backend is accessible:
```bash
curl https://airline-backend.onrender.com/health
```

### Check if airports endpoint works:
```bash
curl https://airline-backend.onrender.com/api/v1/flights/airports
```

### Check CORS headers:
```bash
curl -H "Origin: https://airline-frontend-5rqq.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://airline-backend.onrender.com/api/v1/flights/airports
```

Should return:
```
Access-Control-Allow-Origin: https://airline-frontend-5rqq.onrender.com
Access-Control-Allow-Credentials: true
```

## Latest Commits (In Order)

1. ✅ `f09c811` - Extended return flight seeding to 30 days
2. ✅ `fd36f9d` - Added email, SMS, and flight API integration
3. ✅ `4bd28a6` - Fixed TypeScript compilation errors
4. ✅ `654ac0c` - Fixed CORS configuration ← **This should fix CORS**
5. ✅ `174f7ef` - Removed unnecessary @types/twilio

## What to Report Back

Please check the following and report back:

1. ❓ What is the actual backend URL shown in Render dashboard?
2. ❓ What is the backend service status? (Live/Building/Failed)
3. ❓ What do the latest backend logs show?
4. ❓ Does `/health` endpoint return 200 OK?
5. ❓ Does `/api/v1/flights/airports` endpoint return data?
6. ❓ What errors appear in browser console on frontend?

---

## Expected Result After Fixes

✅ Backend shows "Live" status
✅ Health check returns 200 OK
✅ Airports endpoint returns airport data
✅ Frontend dropdowns populate with airports
✅ Flight search works
✅ Round-trip bookings show return flights up to 30 days out
✅ Booking confirmation sends email (if SMTP configured)
✅ Booking confirmation sends SMS (if Twilio configured)
