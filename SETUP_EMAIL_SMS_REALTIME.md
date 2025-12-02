# 📧 Email, SMS & Real-Time Flight API Setup Guide

## ✅ What Just Happened

I've added **390 flights** covering **all 8 airports** in your system:

### New Routes Added:
- ✈️ **JFK ↔ LAX** (2 per day) - American Airlines & Delta
- ✈️ **JFK ↔ SFO** - United Airlines
- ✈️ **JFK ↔ MIA** - American Airlines
- ✈️ **JFK ↔ LHR** (London) - British Airways
- ✈️ **JFK ↔ CDG** (Paris) - Delta Air Lines
- ✈️ **LAX ↔ SFO** - Delta Air Lines

**All routes have 30 days of availability for round-trip bookings!**

---

## 📧 STEP 1: Set Up Email Notifications (Required)

### Using Gmail (Easiest)

#### 1. Enable 2-Factor Authentication
- Go to: https://myaccount.google.com/security
- Turn on **2-Step Verification**

#### 2. Create App Password
- Go to: https://myaccount.google.com/apppasswords
- Select **"Mail"** and **"Other (Custom name)"**
- Name it: `Airline Reservation System`
- Click **"Generate"**
- Copy the **16-character password** (like: `abcd efgh ijkl mnop`)

#### 3. Add to Render
1. Go to **Render Dashboard → airline-backend → Environment**
2. Click **"Add Environment Variable"**
3. Add these **TWO** variables:

```
Key: SMTP_USER
Value: your.email@gmail.com

Key: SMTP_PASSWORD
Value: abcdefghijklmnop (your 16-char app password, no spaces)
```

4. Click **"Save Changes"**
5. Backend will automatically redeploy (takes 2-3 minutes)

### Alternative: SendGrid (For Production)

If you want a more professional email service:

1. Sign up at: https://signup.sendgrid.com/ (free 100 emails/day)
2. Create API Key: Settings → API Keys → Create API Key
3. Add to Render:

```
SMTP_HOST = smtp.sendgrid.net
SMTP_PORT = 587
SMTP_USER = apikey
SMTP_PASSWORD = your-sendgrid-api-key
```

---

## 📱 STEP 2: Set Up SMS Notifications (Optional)

### Using Twilio ($15 Free Credit)

#### 1. Sign Up
- Go to: https://www.twilio.com/try-twilio
- Sign up (no credit card needed for trial)
- Get **$15 free credit** (~2000 SMS messages)

#### 2. Get Phone Number
- Navigate to: **Phone Numbers → Manage → Buy a number**
- Search for a number in your country
- Purchase it (uses free credits)

#### 3. Get Credentials
- Go to: https://console.twilio.com
- Copy your:
  - **Account SID** (starts with `AC...`)
  - **Auth Token** (click eye icon to reveal)
  - **Phone Number** (format: `+1234567890`)

#### 4. Add to Render
1. Go to **Render Dashboard → airline-backend → Environment**
2. Add these **THREE** variables:

```
Key: TWILIO_ACCOUNT_SID
Value: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Key: TWILIO_AUTH_TOKEN
Value: your_auth_token_here

Key: TWILIO_PHONE_NUMBER
Value: +1234567890
```

3. Click **"Save Changes"**

#### 5. Verify Your Phone (Trial Mode Only)
**Important for testing:**
- Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Click **"Add a new Caller ID"**
- Enter your phone number
- You'll receive a verification code via SMS
- Enter the code to verify

**Note:** In trial mode, SMS can only be sent to verified numbers!

#### 6. Production Mode (Optional)
To send SMS to any number:
- Upgrade your Twilio account
- Cost: ~$0.0075 per SMS in the US

---

## ✈️ STEP 3: Real-Time Flight API (Optional)

### Why Use Real-Time API?
Currently, the system uses **mock flight data** (generated in the database). Real-time APIs provide:
- ✅ Actual airline schedules
- ✅ Real-time flight status
- ✅ Live pricing updates
- ✅ Gate and terminal information

### Option 1: Aviationstack (Best for Testing)

**Free Tier:** 100 API requests/month
**Best for:** Testing, small projects

#### Setup Steps:
1. **Sign up** at: https://aviationstack.com/product
2. **Get API Key**: Dashboard → Your API Access Key
3. **Add to Render**:

```
Key: FLIGHT_API_PROVIDER
Value: aviationstack

Key: FLIGHT_API_KEY
Value: your_aviationstack_api_key_here
```

4. **Backend will automatically redeploy**

#### Pricing:
- Free: 100 requests/month
- Basic: $49.99/month (10,000 requests)
- Professional: $149.99/month (100,000 requests)

### Option 2: Amadeus (Enterprise)

**Best for:** Production, commercial applications

1. **Sign up** at: https://developers.amadeus.com/register
2. **Create App**: Self-Service → My Apps → Create New App
3. Get API Key and API Secret
4. Add to Render (implementation required - currently placeholder)

### Option 3: FlightAware AeroAPI

**Best for:** Professional flight tracking

- More expensive but very comprehensive
- Real-time tracking and historical data
- Implementation is placeholder (needs to be completed)

---

## 🧪 STEP 4: Test Your Setup

### Test Email Notifications

1. **Make a booking** on your frontend
2. **Fill in your email address** (the one you configured in SMTP_USER)
3. **Complete the booking**
4. **Check your inbox** for confirmation email

**Expected Email:**
- Subject: `✈️ Booking Confirmation - [PNR]`
- Beautiful HTML template with:
  - Flight details
  - Booking reference (PNR)
  - Passenger information
  - Total price
  - Next steps for check-in

**If email doesn't arrive:**
- Check **spam folder**
- Check **backend logs** on Render for errors
- Verify SMTP credentials are correct
- Try Gmail's "Less secure apps" setting if needed

### Test SMS Notifications

1. **Make a booking** on your frontend
2. **Enter your verified phone number** (in E.164 format: +1234567890)
3. **Complete the booking**
4. **Check your phone** (should arrive within 1-2 minutes)

**Expected SMS:**
```
✈️ Booking Confirmed!

PNR: ABC123
Passenger: Mr John Doe

Outbound: Delta Air Lines DL200
New York → Los Angeles
Dec 03, 12:30

Return: United Airlines UA300
Los Angeles → New York
Dec 25, 09:00

Total: $569.98

Check-in opens 24h before departure. Have a great flight!
```

**If SMS doesn't arrive:**
- Check **Twilio console logs**: https://console.twilio.com
- Verify phone number is in E.164 format
- Check phone is verified (trial mode requirement)
- Check backend logs for error messages

---

## 📊 What to Expect After Setup

### Backend Logs (Good)
```
⚠️  Only 28 flights found, expected 200+. Re-seeding...
✅ Old data cleared, re-seeding...
🌱 Seeding sample data...
✅ Email service initialized
✅ SMS service initialized
✅ Sample data seeded successfully!
   - 5 airlines
   - 8 airports
   - 3 aircraft
   - 390 flights

🛫 Airline Reservation System API
Server running on: http://localhost:3000
```

### Backend Logs (Partial Setup)
```
⚠️  Email service not configured (missing SMTP credentials)
⚠️  SMS service not configured (missing Twilio credentials)
```
This is OK! Services will work once you add credentials.

---

## 🎯 Testing Checklist

After setting up and backend redeploys:

### ✅ Frontend Tests:
- [ ] **Dropdowns** populate with 8 airports
- [ ] **Search** JFK → LAX shows 2 flights (AA100, DL200)
- [ ] **Search** JFK → SFO shows flights
- [ ] **Search** JFK → MIA shows flights
- [ ] **Search** JFK → LHR shows flights (British Airways)
- [ ] **Search** JFK → CDG shows flights (Paris)
- [ ] **Round-trip** JFK → LAX (Dec 3 → Dec 25) shows return flights
- [ ] **Booking** completes successfully
- [ ] **Email** received with booking confirmation
- [ ] **SMS** received with booking details (if configured)

### ✅ Backend Tests:
- [ ] Backend status shows **"Live"**
- [ ] Health check returns 200 OK: `https://airline-backend-nlsk.onrender.com/health`
- [ ] Airports API works: `https://airline-backend-nlsk.onrender.com/api/v1/flights/airports`
- [ ] Logs show no errors
- [ ] 390 flights seeded

---

## 💰 Cost Estimates

### Monthly Costs (Estimated)

| Service | Free Tier | Low Volume | Medium Volume |
|---------|-----------|------------|---------------|
| **Gmail SMTP** | Free forever | Free | Free |
| **SendGrid** | Free (100/day) | $19.95 (40k) | $89.95 (300k) |
| **Twilio SMS** | $15 credit | ~$15/month | ~$75/month |
| **Aviationstack** | Free (100 req) | $49.99 (10k) | $149.99 (100k) |

### Recommendations:
- **Development**: Use Gmail + Twilio trial (free)
- **Production (small)**: SendGrid free tier + Twilio pay-as-you-go
- **Production (large)**: SendGrid paid + Twilio + Aviationstack

---

## 🔧 Troubleshooting

### Email Not Sending

**Problem**: No email received after booking

**Solutions**:
1. Check SMTP_USER and SMTP_PASSWORD are set correctly
2. Verify Gmail App Password is correct (16 chars, no spaces)
3. Check backend logs for email errors
4. Try different email provider (SendGrid)
5. Check firewall/network allows port 587

### SMS Not Sending

**Problem**: No SMS received after booking

**Solutions**:
1. Verify phone number is verified in Twilio console
2. Check phone format is E.164 (+1234567890, not +1 234 567 8900)
3. Check Twilio account has credits
4. Review Twilio console logs for delivery status
5. Ensure TWILIO_PHONE_NUMBER matches your Twilio number

### Return Flights Not Showing

**Problem**: Round-trip search shows 0 return flights

**Solutions**:
1. Wait for backend to redeploy (check Render dashboard)
2. Check backend logs show "390 flights" seeded
3. Hard refresh frontend (Ctrl+Shift+R)
4. Try a different date range
5. Check browser console for API errors

### No Flights for Certain Routes

**Problem**: Some airport combinations show no results

**Solutions**:
1. Check if route exists in the list above
2. Try reverse direction (e.g., SFO → JFK instead of JFK → SFO)
3. Wait for backend redeploy to complete
4. Check backend logs for seeding errors

---

## 📝 Summary

### What's Set Up:
✅ **390 flights** covering 8 airports
✅ **30-day availability** for all routes
✅ **Email service** (needs SMTP credentials)
✅ **SMS service** (needs Twilio credentials)
✅ **Real-time API framework** (optional, needs API key)

### What You Need to Do:
1. ⏳ **Wait** 2-3 minutes for backend to redeploy
2. 🔑 **Add SMTP credentials** to Render for email (Gmail recommended)
3. 🔑 **Add Twilio credentials** to Render for SMS (optional)
4. 🔑 **Add flight API key** to Render for real-time data (optional)
5. ✅ **Test** bookings with your email/phone
6. 🎉 **Enjoy** your fully functional airline reservation system!

---

## 🆘 Need Help?

If you encounter any issues:
1. Check **backend logs** on Render dashboard
2. Check **browser console** (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Try clearing browser cache and hard refresh
5. Test API endpoints directly in browser
6. Check service status pages (Gmail, Twilio, Aviationstack)

---

**Last Updated**: Session completion
**Backend URL**: https://airline-backend-nlsk.onrender.com
**Frontend URL**: https://airline-frontend-5rqq.onrender.com
