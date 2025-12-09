# 🧪 Testing Guide - Email, SMS & Real-Time Flight Data

## ✅ What's Been Integrated

### 1. Real-Time Flight Status (Aviationstack API)
- ✅ Integrated into flight search
- ✅ Smart 5-minute caching to save API calls
- ✅ Graceful fallback if API fails
- ✅ Enriches flights with: actual times, gates, delays, status

### 2. Email Notifications (Gmail SMTP)
- ✅ Beautiful HTML templates
- ✅ Booking confirmation with all details
- ✅ Sends after successful booking

### 3. SMS Notifications (Twilio)
- ✅ Concise SMS format
- ✅ Booking summary with PNR
- ✅ Sends after successful booking

---

## 📋 Step-by-Step Testing

### Step 1: Check Backend Configuration

**Go to Render Dashboard → airline-backend → Logs**

Look for these initialization messages:

```
✅ Email service initialized
✅ SMS service initialized
✅ Real-time flight API initialized (aviationstack)
✅ Sample data seeded successfully!
   - 5 airlines
   - 8 airports
   - 3 aircraft
   - 390 flights
```

**If you see this instead:**
```
⚠️  Email service not configured (missing SMTP credentials)
⚠️  SMS service not configured (missing Twilio credentials)
⚠️  Real-time flight API not configured
```

**Then:** Your credentials weren't saved correctly. Re-check Render Environment variables.

---

### Step 2: Test Flight Search with Real-Time Data

#### Test A: Simple Search

1. Go to: https://airline-frontend-5rqq.onrender.com
2. Search: **JFK → LAX, Dec 3, 2025**
3. Click **"Search Flights"**

**Expected Results:**
- 2 flights appear (AA100, DL200)
- Check backend logs for:
  ```
  📡 Fetching real-time data for AA100
  📡 Fetching real-time data for DL200
  ```

**What This Tests:**
- Database flights work
- API is being called
- Real-time enrichment is attempted

#### Test B: Cached Search

1. **Immediately search again** (same route, same date)
2. Check backend logs

**Expected Results:**
- Backend logs show:
  ```
  💾 Using cached data for AA100
  💾 Using cached data for DL200
  ```

**What This Tests:**
- Caching is working (saves API calls!)
- No duplicate API requests within 5 minutes

#### Test C: Multiple Routes

Try searching different routes:
- **JFK → SFO** (San Francisco)
- **JFK → MIA** (Miami)
- **JFK → LHR** (London)
- **LAX → SFO** (West Coast)

**Expected Results:**
- All routes return flights
- Backend fetches real-time data for new flights
- Previously searched flights use cache

---

### Step 3: Test Round-Trip with Return Flights

1. **Search**: JFK → LAX
2. **Outbound**: Dec 3, 2025
3. **Return**: Dec 25, 2025
4. **Trip Type**: Round Trip
5. Click **"Search Flights"**

**Expected Results:**
- **Outbound**: 2 flights (AA100, DL200 at 2:00 AM and 12:30 PM)
- **Return**: 1 flight (UA300 at 9:00 AM)
- Backend logs show API calls for 3 flights (if not cached)

**What This Tests:**
- 30-day flight seeding works
- Return flights are available
- Real-time data enrichment for multiple flights

---

### Step 4: Test Email Notifications

#### Pre-Test Checklist:
- [ ] SMTP_USER is set to your Gmail address
- [ ] SMTP_PASSWORD is set to your 16-char App Password
- [ ] Backend logs show "✅ Email service initialized"

#### Test Steps:

1. **Search and Select Flight**: JFK → LAX, Dec 3
2. **Select Outbound**: Click "Select Flight" on AA100 or DL200
3. **Click "Continue to Booking"**
4. **Fill Passenger Details:**
   - Title: Mr/Mrs/Ms
   - First Name: Your name
   - Last Name: Your last name
   - Email: **YOUR GMAIL ADDRESS** (the one you configured)
   - Phone: Your phone number
   - Date of Birth: Any date
   - Gender: Any
   - Nationality: US
5. **Click "Complete Booking"**

**Expected Results:**

**Backend Logs:**
```
✅ Email sent successfully: <message_id>
```

**Your Inbox (within 1-2 minutes):**
- Subject: `✈️ Booking Confirmation - [PNR]`
- Beautiful HTML email with:
  - Flight details
  - PNR (6-character code)
  - Passenger name
  - Total price
  - Next steps

**If Email Doesn't Arrive:**
1. Check **Spam folder** (Gmail sometimes filters)
2. Check backend logs for errors
3. Verify SMTP credentials are correct
4. Try different email address
5. Check Gmail account settings

---

### Step 5: Test SMS Notifications

#### Pre-Test Checklist:
- [ ] TWILIO_ACCOUNT_SID is set
- [ ] TWILIO_AUTH_TOKEN is set
- [ ] TWILIO_PHONE_NUMBER is set
- [ ] Your phone is verified at: https://console.twilio.com (trial mode requirement)
- [ ] Backend logs show "✅ SMS service initialized"

#### Test Steps:

1. **Make Another Booking** (same process as Step 4)
2. **Important**: Use phone format: `+1234567890` (E.164 format, no spaces or dashes)
3. **Use YOUR verified phone number**
4. **Complete booking**

**Expected Results:**

**Backend Logs:**
```
✅ SMS sent successfully: SM...
```

**Your Phone (within 1-2 minutes):**
```
✈️ Booking Confirmed!

PNR: ABC123
Passenger: Mr John Doe

Outbound: Delta Air Lines DL200
New York → Los Angeles
Dec 03, 12:30

Total: $279.99

Check-in opens 24h before departure. Have a great flight!
```

**If SMS Doesn't Arrive:**
1. Check **Twilio console logs**: https://console.twilio.com
2. Verify phone is in E.164 format (+1234567890)
3. Verify phone is verified in Twilio
4. Check Twilio account has credits
5. Check backend logs for errors
6. Wait up to 5 minutes (sometimes delayed)

---

### Step 6: Test Round-Trip Booking with Both Notifications

1. **Search Round-Trip**: JFK → LAX, Dec 3 → Dec 25
2. **Select Outbound**: AA100 (2:00 AM)
3. **Select Return**: UA300 (9:00 AM)
4. **Review Total**: Should show sum of both flights
5. **Fill Details**: Your email and phone
6. **Complete Booking**

**Expected Results:**
- Booking succeeds with PNR
- Email received with **BOTH flights** listed (outbound + return)
- SMS received with **BOTH flights** listed
- Backend logs show:
  ```
  ✅ Email sent successfully
  ✅ SMS sent successfully
  ```

---

## 🔍 Backend Logs: What to Look For

### Good Logs (Everything Working):

```
⚠️  Only 28 flights found, expected 200+. Re-seeding...
✅ Old data cleared, re-seeding...
✅ Email service initialized
✅ SMS service initialized
✅ Real-time flight API initialized (aviationstack)
✅ Sample data seeded successfully!
   - 5 airlines
   - 8 airports
   - 3 aircraft
   - 390 flights

🛫 Airline Reservation System API
Server running on: http://localhost:3000

GET /api/v1/flights/search 200
📡 Fetching real-time data for AA100
📡 Fetching real-time data for DL200
💾 Using cached data for AA100
✅ Email sent successfully: <1234567890.123.456@smtp.gmail.com>
✅ SMS sent successfully: SM1234567890abcdef
```

### Problem Logs:

```
⚠️  Email service not configured (missing SMTP credentials)
```
**Fix**: Add SMTP_USER and SMTP_PASSWORD to Render

```
❌ Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Fix**: Wrong App Password, regenerate it

```
❌ Error sending SMS: The number +1234567890 is unverified
```
**Fix**: Verify phone at https://console.twilio.com

```
⚠️  Twilio SDK not installed
```
**Fix**: Should auto-install, try manual redeploy

```
❌ Real-time enrichment failed: Request failed with status code 403
```
**Fix**: Wrong Aviationstack API key, check credentials

---

## 📊 Real-Time API Usage Monitoring

### Check API Usage:

**Aviationstack:**
- Go to: https://aviationstack.com/dashboard
- Check "API Requests This Month"
- Free tier: 100 requests/month
- Each flight search = up to 2 API calls (if not cached)
- With caching: ~10-20 requests per day of testing

### Optimize API Usage:

1. **Cache is Active**: Searches within 5 minutes use cache (0 API calls)
2. **Search Once**: Don't refresh unnecessarily
3. **Test Different Routes**: Each new route uses 1-2 API calls
4. **Production**: Consider upgrading to paid tier if needed

### Check Cache Effectiveness:

Look for these patterns in logs:
```
📡 Fetching real-time data for AA100  ← New API call (counts toward limit)
💾 Using cached data for AA100        ← Cached (FREE! No API call)
```

**Good Pattern**: More 💾 than 📡
**Bad Pattern**: All 📡 (cache not working or too many unique searches)

---

## ✅ Complete Testing Checklist

### Backend Setup:
- [ ] Backend shows "Live" on Render
- [ ] 390 flights seeded
- [ ] Email service initialized
- [ ] SMS service initialized
- [ ] Real-time API initialized

### Flight Search:
- [ ] Can search JFK → LAX
- [ ] Can search JFK → SFO
- [ ] Can search JFK → MIA
- [ ] Can search JFK → LHR
- [ ] Round-trip search shows return flights
- [ ] Backend logs show real-time API calls
- [ ] Cache works (second search shows cached data)

### Email Notifications:
- [ ] One-way booking sends email
- [ ] Round-trip booking sends email
- [ ] Email shows correct flight details
- [ ] Email shows correct PNR
- [ ] Email has beautiful HTML formatting

### SMS Notifications:
- [ ] One-way booking sends SMS
- [ ] Round-trip booking sends SMS
- [ ] SMS shows correct flight summary
- [ ] SMS shows correct PNR
- [ ] SMS format is concise and readable

### Real-Time Integration:
- [ ] API fetches data for new flights
- [ ] Cache stores data for 5 minutes
- [ ] Cached searches don't hit API
- [ ] API failure doesn't break search
- [ ] Flights show even if API is down

---

## 🐛 Common Issues & Solutions

### Issue: "No return flights found"
**Solution**:
- Check backend logs show "390 flights"
- Wait for backend to finish redeploying
- Hard refresh frontend (Ctrl+Shift+R)

### Issue: Email not received
**Solution**:
- Check spam folder
- Verify SMTP credentials in Render
- Check backend logs for email errors
- Try different email address
- Regenerate Gmail App Password

### Issue: SMS not received
**Solution**:
- Verify phone at Twilio console
- Use E.164 format: +1234567890
- Check Twilio account has credits
- Review Twilio error logs
- Wait up to 5 minutes

### Issue: Real-time data not updating
**Solution**:
- Check Aviationstack API key is correct
- Verify API key is active (dashboard)
- Check you haven't exceeded 100 requests/month
- Review backend logs for API errors
- Remember: Mock flights won't match real flights exactly

### Issue: Backend keeps redeploying
**Solution**:
- Check for TypeScript errors in logs
- Wait for full deployment to complete
- Check all environment variables are set
- Try manual "Clear cache & deploy"

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ **Flight Search**: Returns results for all routes
✅ **Round-Trip**: Shows return flights 30 days out
✅ **Real-Time**: Backend logs show API calls and caching
✅ **Email**: Received within 2 minutes with correct details
✅ **SMS**: Received within 2 minutes with correct summary
✅ **Booking**: PNR generated and stored successfully
✅ **Error Handling**: System works even if API/email/SMS fails

---

## 📝 Next Steps

After testing succeeds:

1. **Production Readiness**:
   - Consider upgrading Aviationstack to paid tier
   - Upgrade Twilio account to send to non-verified numbers
   - Consider switching to SendGrid for email (more reliable)
   - Add monitoring/alerts for failed notifications

2. **User Experience**:
   - Show real-time status badges on flights ("On Time", "Delayed")
   - Display gate information if available
   - Add SMS opt-in checkbox (don't send if user doesn't want)
   - Add booking management page

3. **Cost Optimization**:
   - Monitor API usage daily
   - Increase cache duration if needed (currently 5 minutes)
   - Consider Redis for distributed caching
   - Batch API calls if possible

---

**Happy Testing!** 🚀

If you encounter any issues not covered here, check:
1. Backend logs on Render
2. Browser console (F12) for frontend errors
3. Service provider dashboards (Gmail, Twilio, Aviationstack)
4. Environment variables are correctly set
