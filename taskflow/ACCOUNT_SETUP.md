# Account Setup Guide for madhanitm@gmail.com

This guide will help you set up your Google Play Developer account and Firebase project for TaskFlow deployment.

## Google Play Developer Account Setup

### Step 1: Access Play Console

1. Go to: https://play.google.com/console
2. Sign in with: **madhanitm@gmail.com**
3. If you see "Get started" or "Create account", proceed to Step 2
4. If you're already registered, skip to Step 3

### Step 2: Register Developer Account (If Needed)

1. Click **"Create account"** or **"Get started"**
2. Accept the Developer Distribution Agreement
3. Pay the one-time registration fee: **$25 USD**
4. Complete your developer profile:
   - **Developer name**: Your name or company name
   - **Email address**: madhanitm@gmail.com
   - **Phone number**: Your contact number
   - **Address**: Your physical address
   - **Payment information**: Credit card or other payment method

5. Wait for account verification (usually instant, but can take up to 48 hours)

### Step 3: Verify Account Access

- [ ] You can access: https://play.google.com/console
- [ ] Your account shows as "Active" or "Verified"
- [ ] You can see the dashboard

**Note**: If you encounter any issues, ensure:
- You're using the correct Google account (madhanitm@gmail.com)
- Payment method is valid
- All required fields are completed

## Firebase Project Verification

### Verify Firebase Access

1. Go to: https://console.firebase.google.com/
2. Sign in with: **madhanitm@gmail.com**
3. Check if you can access project: **claude-project-10b09**

### Current Firebase Configuration

Your Firebase project details:
- **Project ID**: claude-project-10b09
- **Project Name**: claude-project-10b09
- **Firebase Console**: https://console.firebase.google.com/u/0/project/claude-project-10b09

### Verify Firebase Services

Ensure these are enabled in Firebase Console:

1. **Authentication**
   - Go to: Build → Authentication
   - Verify Email/Password is enabled
   - Verify Google Sign-in is enabled
   - Support email: madhanitm@gmail.com

2. **Firestore Database**
   - Go to: Build → Firestore Database
   - Verify database exists
   - Check security rules are published

3. **Project Settings**
   - Go to: Project Settings (gear icon)
   - Verify app is registered
   - Note the web app configuration

### Add Android App to Firebase (If Needed)

If your Firebase project doesn't have an Android app registered:

1. Go to: Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click **Android icon** to add Android app
4. Enter:
   - **Android package name**: `com.taskflow.app`
   - **App nickname**: TaskFlow Android
   - **Debug signing certificate SHA-1** (optional for now)
5. Click "Register app"
6. Download `google-services.json`
7. Place it in: `android/app/google-services.json`

**Note**: This step is optional if you're only using web authentication. Firebase web config works for Capacitor apps.

## Google Services Configuration

### OAuth Consent Screen (For Google Sign-In)

If you plan to use Google Sign-In in the Android app:

1. Go to: https://console.cloud.google.com/
2. Select project: **claude-project-10b09**
3. Navigate to: APIs & Services → OAuth consent screen
4. Configure:
   - **User Type**: External (for public app)
   - **App name**: TaskFlow
   - **User support email**: madhanitm@gmail.com
   - **Developer contact**: madhanitm@gmail.com
5. Add scopes (if needed)
6. Add test users (during testing)
7. Submit for verification (if publishing to all users)

## Android Developer Account Settings

### Update Developer Profile

In Google Play Console:

1. Go to: Settings → Developer account
2. Complete/verify:
   - **Account details**: Name, email (madhanitm@gmail.com)
   - **Contact details**: Phone, address
   - **Payment information**: Valid payment method
   - **Tax information**: Complete if applicable

### Account Permissions

- [ ] You are the primary account holder
- [ ] You have admin access
- [ ] Payment method is active

## Testing Checklist

Before deploying, test:

1. **Firebase Authentication**
   - Test email/password signup
   - Test email/password login
   - Test Google sign-in

2. **Firestore Access**
   - Create a task
   - Verify it saves to Firestore
   - Verify it syncs across devices

3. **App Functionality**
   - All features work correctly
   - No crashes
   - Good performance

## Common Issues & Solutions

### Issue: Can't access Play Console

**Solution**:
- Verify you're using madhanitm@gmail.com
- Clear browser cache
- Try incognito mode
- Check if account needs verification

### Issue: Firebase project not accessible

**Solution**:
- Verify account has access to the project
- Check Firebase Console permissions
- Verify you're signed in with the correct account

### Issue: Payment method declined

**Solution**:
- Use a valid credit card
- Ensure billing address matches
- Contact Google Play support if needed

## Next Steps

Once your accounts are set up:

1. ✅ Google Play Developer Account active
2. ✅ Firebase project accessible
3. ✅ All services verified
4. → Proceed to: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Support Contacts

**Your Account**: madhanitm@gmail.com
**Google Play Support**: https://support.google.com/googleplay/android-developer
**Firebase Support**: https://firebase.google.com/support

---

**Ready to proceed? Complete the account setup checklist above, then move to the deployment checklist!**

