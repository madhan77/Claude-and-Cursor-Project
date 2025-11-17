# Google Security Tracker - Complete Setup Guide

This guide will walk you through setting up the Google Security Tracker from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm or yarn package manager
- A Google account
- Basic knowledge of command line operations

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `google-security-tracker`
4. (Optional) Enable Google Analytics
5. Click "Create project"

### Step 2: Register Your Web App

1. In your Firebase project, click the web icon (`</>`)
2. Register app name: "Google Security Tracker"
3. (Optional) Check "Also set up Firebase Hosting"
4. Click "Register app"
5. **Copy the Firebase configuration** - you'll need this later

Example config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Google** sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email
   - Click "Save"

### Step 4: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your region (choose closest to your users)
5. Click "Enable"

### Step 5: Set Firestore Security Rules

In Firestore Database, go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Security scan results
    match /scans/{scanId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

Click "Publish"

## Google Cloud Console Setup

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project from the dropdown
   - Or create a new project if you didn't link Firebase

### Step 2: Enable Required APIs

1. Go to **APIs & Services > Library**
2. Search for and enable each of these APIs:

   **Gmail API**
   - Search "Gmail API"
   - Click "Enable"

   **YouTube Data API v3**
   - Search "YouTube Data API v3"
   - Click "Enable"

   **Google Drive API**
   - Search "Google Drive API"
   - Click "Enable"

   **Google Calendar API**
   - Search "Google Calendar API"
   - Click "Enable"

   **People API**
   - Search "People API"
   - Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Click "Create"

**App Information:**
- App name: `Google Security Tracker`
- User support email: Your email
- Developer contact: Your email

**App Domain (Optional):**
- Leave blank for development

**Scopes:**
Click "Add or Remove Scopes" and add:
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.metadata.readonly`
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`

**Test Users (for development):**
Add your email address

Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: `Google Security Tracker Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5174
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:5174
http://localhost:5174/__/auth/handler
```

5. Click "Create"
6. **Copy your Client ID and Client Secret** - you'll need these!

## Environment Configuration

### Step 1: Create Environment File

In your project directory:

```bash
cd google-security-tracker
cp .env.example .env
```

### Step 2: Configure .env File

Open `.env` and fill in your credentials:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Google OAuth 2.0 (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-abc...

# API Configuration
VITE_API_BASE_URL=http://localhost:5174
```

### Step 3: Install Dependencies

```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### First Time Usage

1. Open `http://localhost:5174` in your browser
2. Click "Sign in with Google"
3. Select your Google account
4. **Grant all requested permissions** (this is crucial!)
5. You'll be redirected to the dashboard
6. Click "Run Security Scan" to start analyzing

## Troubleshooting

### Issue: "Access blocked: This app's request is invalid"

**Solution:**
- Verify OAuth consent screen is configured
- Check that all scopes are added
- Ensure redirect URIs match exactly

### Issue: "Failed to analyze Gmail"

**Solution:**
- Confirm Gmail API is enabled
- Check OAuth scopes include Gmail permissions
- Log out and log back in to refresh permissions

### Issue: "Unauthorized" or 403 errors

**Solution:**
- Verify all required APIs are enabled
- Check that OAuth credentials are correct
- Ensure you're using the correct project
- Add your email as a test user in OAuth consent screen

### Issue: "Origin not allowed"

**Solution:**
- Add `http://localhost:5174` to authorized JavaScript origins
- Clear browser cache
- Restart dev server

### Issue: Charts not showing

**Solution:**
- Run a security scan first
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

### Issue: "Firebase: Error (auth/unauthorized-domain)"

**Solution:**
- Go to Firebase Console > Authentication > Settings
- Add `localhost` and `localhost:5174` to authorized domains

### Issue: Scopes not requested during sign-in

**Solution:**
- Check `src/firebase/config.js` has all scopes listed
- Clear browser cookies and cache
- Try in incognito mode

## Production Deployment

### Update OAuth Credentials

1. Add your production domain to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
   - Firebase authorized domains

2. Update `.env` with production URL:
```env
VITE_API_BASE_URL=https://yourdomain.com
```

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Security Best Practices

1. **Never commit `.env` to git**
   - Already in `.gitignore`
   - Use environment variables on hosting platform

2. **Rotate OAuth credentials regularly**
   - Especially if exposed

3. **Review Firestore rules**
   - Ensure users can only access their own data

4. **Enable Firebase App Check** (optional but recommended)
   - Protects against abuse

5. **Monitor usage**
   - Check Google Cloud Console > APIs & Services > Dashboard
   - Set up billing alerts

## Next Steps

- Customize the security analysis rules in `src/services/securityAnalysisService.js`
- Add more Google services (Photos, Contacts, etc.)
- Implement email notifications for critical findings
- Set up scheduled scans with Cloud Functions
- Create mobile app version

## Support

If you encounter issues not covered here:
1. Check the browser console for errors
2. Review Firebase and Google Cloud Console logs
3. Open an issue on GitHub with detailed error messages

---

**Need help?** Open an issue or contact support.
