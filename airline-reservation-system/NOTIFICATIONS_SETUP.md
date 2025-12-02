# Email & SMS Notifications Setup Guide

This guide explains how to configure email and SMS notifications for booking confirmations in the Airline Reservation System.

## Overview

The system now supports:
- ✉️ **Email notifications** via SMTP (Gmail, SendGrid, AWS SES, etc.)
- 📱 **SMS notifications** via Twilio
- ✈️ **Real-time flight data** via Aviationstack, Amadeus, or FlightAware

All services are **optional** and gracefully degrade if not configured. The booking system will continue to work even if these services are unavailable.

---

## 📧 Email Configuration

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Airline Reservation System"
   - Copy the 16-character password

3. **Update Environment Variables** on Render:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your.email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up** at https://signup.sendgrid.com/

2. **Create API Key**
   - Navigate to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access" and enable "Mail Send"
   - Copy the API key

3. **Update Environment Variables**:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: AWS SES (Enterprise)

1. **Set up AWS SES** in your region
2. **Verify your domain** or email address
3. **Create SMTP credentials** in SES console
4. **Update Environment Variables**:
   ```
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   ```

---

## 📱 SMS Configuration (Twilio)

### Step 1: Sign Up for Twilio

1. **Create Account**: https://www.twilio.com/try-twilio
   - Get $15 free credit (no credit card required for trial)

2. **Get a Phone Number**
   - Navigate to Phone Numbers > Manage > Buy a number
   - Search for a number in your region
   - Purchase it (uses free credits)

### Step 2: Get Credentials

1. **Find your credentials** at https://console.twilio.com
   - Account SID (starts with `AC...`)
   - Auth Token (click to reveal)
   - Phone Number (format: +1234567890)

### Step 3: Configure Environment Variables

Add these to your Render environment variables:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Important Notes

- **Trial Mode**: SMS can only be sent to verified numbers
  - Verify numbers at https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- **Production**: Upgrade your account to send to any number
- **Costs**: ~$0.0075 per SMS in the US (free credits cover ~2000 messages)

---

## ✈️ Real-Time Flight API Configuration

The system supports multiple flight data providers. Choose one based on your needs:

### Option 1: Aviationstack (Recommended for Testing)

**Best for**: Small projects, testing, development

1. **Sign up**: https://aviationstack.com/product
   - Free tier: 100 API requests/month
   - No credit card required

2. **Get API Key**:
   - Dashboard > Your API Access Key
   - Copy the access key

3. **Configure Environment Variables**:
   ```
   FLIGHT_API_PROVIDER=aviationstack
   FLIGHT_API_KEY=your_aviationstack_api_key
   ```

**Features**:
- Real-time flight status and tracking
- Historical flight data
- Airport and airline information
- 30-60 second data delay

**Pricing**:
- Free: 100 requests/month
- Basic: $49.99/month (10,000 requests)
- Professional: $149.99/month (100,000 requests)

### Option 2: Amadeus (Enterprise Solution)

**Best for**: Production, commercial applications

1. **Sign up**: https://developers.amadeus.com/register
   - Test environment is free
   - Production requires approval

2. **Create App**:
   - Self-Service > My Apps > Create New App
   - Get API Key and API Secret

3. **Configure Environment Variables**:
   ```
   FLIGHT_API_PROVIDER=amadeus
   FLIGHT_API_KEY=your_amadeus_api_key
   FLIGHT_API_SECRET=your_amadeus_api_secret
   ```

**Features**:
- Comprehensive flight search and booking
- Real-time pricing
- Seat maps and availability
- 40,000+ destinations

**Note**: Implementation for Amadeus is a placeholder. You'll need to implement the OAuth2 flow and API integration.

### Option 3: FlightAware AeroAPI

**Best for**: Professional flight tracking

1. **Sign up**: https://www.flightaware.com/commercial/aeroapi/
2. **Get API Key**: Dashboard > API Keys
3. **Configure**:
   ```
   FLIGHT_API_PROVIDER=flightaware
   FLIGHT_API_KEY=your_flightaware_api_key
   ```

**Note**: Implementation is a placeholder and needs to be completed.

---

## 🚀 Deployment Steps

### 1. Add Environment Variables on Render

1. Go to your backend service on Render
2. Navigate to **Environment** tab
3. Add the following variables (only add what you need):

#### Required for Email:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`

#### Required for SMS:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

#### Optional for Real-time Flights:
- `FLIGHT_API_PROVIDER`
- `FLIGHT_API_KEY`

### 2. Install Dependencies

The following packages have been added to `package.json`:
- `nodemailer` - Email sending
- `twilio` - SMS sending
- `axios` - HTTP requests for flight APIs
- `date-fns` - Date formatting

Run in your backend directory:
```bash
npm install
```

### 3. Redeploy

Push your changes to trigger a redeploy:
```bash
git add .
git commit -m "Add email, SMS, and flight API integration"
git push
```

Or manually redeploy from the Render dashboard.

---

## 🧪 Testing

### Test Email

Make a booking and check:
1. **Console logs**: Look for "✅ Email sent successfully"
2. **Your inbox**: Check for booking confirmation email
3. **Spam folder**: Check if email was filtered

**Common Issues**:
- Gmail blocking: Enable "Less secure app access"
- Wrong credentials: Double-check App Password
- Firewall: Ensure port 587 is open

### Test SMS

Make a booking with a verified phone number:
1. **Console logs**: Look for "✅ SMS sent successfully"
2. **Your phone**: Check for SMS within 1-2 minutes
3. **Twilio logs**: Check console.twilio.com for delivery status

**Common Issues**:
- Trial mode: Only verified numbers receive SMS
- Phone format: Must be in E.164 format (+1234567890)
- Invalid number: Check Twilio error logs

### Test Flight API

Check console logs on startup:
1. With API key: "✅ Real-time flight API initialized (aviationstack)"
2. Without API key: "⚠️ Real-time flight API not configured"

Currently, flight API is set up but not integrated into search results. To fully integrate:
1. Update `flight.controller.ts` to call `flightAPIService.searchFlights()`
2. Merge real-time data with database results
3. Add caching to respect rate limits

---

## 💰 Cost Estimates

### Monthly Costs (Approximate)

| Service | Free Tier | Low Volume | Medium Volume | High Volume |
|---------|-----------|------------|---------------|-------------|
| **Gmail** | Free | Free | Free | Free |
| **SendGrid** | Free (100/day) | $19.95 (40k) | $89.95 (300k) | Custom |
| **Twilio SMS** | $15 credit | ~$15/month | ~$75/month | ~$300/month |
| **Aviationstack** | Free (100) | $49.99 (10k) | $149.99 (100k) | Custom |
| **Amadeus** | Test free | Quote | Quote | Enterprise |

### Optimization Tips

1. **Email**: Use Gmail for dev, SendGrid for production
2. **SMS**: Only send for confirmed bookings, not for cart/pending
3. **Flight API**: Cache responses, use database for most searches
4. **Rate Limits**: Implement Redis caching for flight data

---

## 📊 Monitoring

### Check Service Status

The backend logs will show service initialization:

```
✅ Database connected successfully
✅ Email service initialized
✅ SMS service initialized
✅ Real-time flight API initialized (aviationstack)
```

If services are not configured:

```
⚠️ Email service not configured (missing SMTP credentials)
⚠️ SMS service not configured (missing Twilio credentials)
⚠️ Real-time flight API not configured
```

### Notification Failures

Bookings will succeed even if notifications fail. Check logs for:

```
❌ Error sending email: [error details]
❌ Error sending SMS: [error details]
```

---

## 🔒 Security Best Practices

1. **Never commit credentials** to Git
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Enable 2FA** on all service accounts
5. **Monitor usage** to detect unauthorized access
6. **Use HTTPS** for all API calls
7. **Validate phone numbers** before sending SMS
8. **Sanitize email content** to prevent injection

---

## 🆘 Troubleshooting

### Email Not Sending

1. Check SMTP credentials are correct
2. Verify port 587 is not blocked
3. Check Gmail "Less secure apps" setting
4. Look for firewall restrictions
5. Test with a different SMTP provider

### SMS Not Sending

1. Verify phone number is in E.164 format
2. Check Twilio account has credits
3. Ensure number is verified (trial mode)
4. Check Twilio console for error logs
5. Verify auth token is correct

### Flight API Not Working

1. Check API key is valid
2. Verify rate limits not exceeded
3. Check API provider status page
4. Ensure correct API endpoint URL
5. Review API response in logs

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Aviationstack API Docs](https://aviationstack.com/documentation)
- [Amadeus for Developers](https://developers.amadeus.com/get-started/get-started-with-self-service-apis-335)
- [SendGrid SMTP Integration](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

---

## 🎯 Next Steps

1. ✅ Configure email service (start with Gmail)
2. ✅ Test with a booking
3. ✅ Configure SMS service (optional)
4. ✅ Test with verified phone number
5. ⏳ Set up flight API (when needed)
6. ⏳ Upgrade to production services
7. ⏳ Implement monitoring and alerts
8. ⏳ Add email templates customization
9. ⏳ Add SMS opt-in/opt-out functionality

---

Need help? Check the backend console logs for detailed error messages and status updates.
