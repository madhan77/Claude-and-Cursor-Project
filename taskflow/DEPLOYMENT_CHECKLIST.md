# TaskFlow - Deployment Checklist for madhanitm@gmail.com

This checklist is specific to deploying TaskFlow to Google Play Store using your account: **madhanitm@gmail.com**

## Pre-Deployment Checklist

### ✅ Account Setup
- [ ] Verify Google Play Developer Account is registered with **madhanitm@gmail.com**
  - Go to: https://play.google.com/console
  - Ensure you're logged in with madhanitm@gmail.com
  - If not registered: Sign up ($25 one-time fee)
  - Complete developer profile with payment info

### ✅ Development Environment
- [ ] Android Studio installed
- [ ] Java JDK 17+ installed (`java -version`)
- [ ] Android SDK installed (via Android Studio)
- [ ] Environment variables set:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### ✅ Firebase Configuration
- [ ] Verify Firebase project is accessible with madhanitm@gmail.com
  - Current project: `claude-project-10b09`
  - Verify at: https://console.firebase.google.com/u/0/project/claude-project-10b09
- [ ] Ensure Firebase Authentication is enabled
- [ ] Verify Firestore rules are published
- [ ] Test Firebase connection in the app

### ✅ App Configuration
- [ ] App ID configured: `com.taskflow.app`
- [ ] App Name: `TaskFlow`
- [ ] Version Code: `1`
- [ ] Version Name: `1.0`
- [ ] Build web assets: `npm run build`
- [ ] Sync with Capacitor: `npx cap sync android`

## Build & Signing

### ✅ Generate Keystore (First Time Only)
```bash
cd android
./generate-keystore.sh
```
- [ ] Keystore generated: `taskflow-release-key.jks`
- [ ] Password saved securely (you'll need this for all future updates!)
- [ ] Keystore backed up to secure location

### ✅ Configure Signing
- [ ] Copy template: `cp android/app/key.properties.example android/app/key.properties`
- [ ] Edit `android/app/key.properties`:
  ```
  storePassword=YOUR_KEYSTORE_PASSWORD
  keyPassword=YOUR_KEY_PASSWORD
  keyAlias=taskflow-key
  storeFile=/absolute/path/to/android/app/taskflow-release-key.jks
  ```
- [ ] Verify `build.gradle` has signing configuration (already done)

### ✅ Build Release Bundle
```bash
npm run build
npx cap sync android
npm run android:build
```
- [ ] Build successful
- [ ] Bundle file created: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] File size is reasonable (< 150 MB)

### ✅ Test Release Build (Optional but Recommended)
```bash
npm run android:build-apk
adb install android/app/build/outputs/apk/release/app-release.apk
```
- [ ] Test on physical device or emulator
- [ ] Verify all features work:
  - [ ] User authentication (email/password)
  - [ ] Google sign-in
  - [ ] Task creation
  - [ ] Task management (edit, delete, complete)
  - [ ] Categories and priorities
  - [ ] Due dates
  - [ ] Search functionality
  - [ ] Firebase sync

## Google Play Console Setup

### ✅ Account Verification
- [ ] Logged into Google Play Console with: **madhanitm@gmail.com**
- [ ] Developer account status: Active
- [ ] Payment method verified

### ✅ Create App
1. Go to: https://play.google.com/console
2. Click **"Create app"**
3. Fill in:
   - [ ] **App name**: TaskFlow
   - [ ] **Default language**: English (United States)
   - [ ] **App or game**: App
   - [ ] **Free or paid**: Free
   - [ ] **Developer account**: madhanitm@gmail.com
4. Accept declarations and create

### ✅ Store Listing

Navigate to: **Store presence → Main store listing**

- [ ] **App name**: TaskFlow
- [ ] **Short description** (80 chars max):
  ```
  Manage tasks efficiently with categories, priorities, and due dates
  ```
- [ ] **Full description** (4000 chars max):
  ```
  TaskFlow is a modern, full-featured task management application that helps you stay organized and productive.

  Key Features:
  • User Authentication - Secure login with email/password or Google OAuth
  • Task Management - Add, edit, delete, and mark tasks as completed
  • Categorization - Organize tasks by custom categories, tags, and priority levels (Low, Medium, High)
  • Due Dates - Set due dates for tasks with visual indicators for overdue items
  • Task Filtering - Filter by Today, Upcoming, Active, Completed, or All tasks
  • Task Sorting - Sort by creation date, due date, or priority
  • Dashboard Views - Overview with statistics and task breakdowns
  • Search Functionality - Real-time keyword search across task titles, descriptions, and tags
  • Real-time Sync - Automatic synchronization across devices using Firebase

  TaskFlow uses Firebase for secure authentication and real-time data synchronization, ensuring your tasks are always available across all your devices.

  Get started today and take control of your productivity!
  ```
- [ ] **App icon**: 512×512 px PNG uploaded
- [ ] **Feature graphic**: 1024×500 px PNG uploaded
- [ ] **Screenshots**: At least 2 uploaded (up to 8 recommended)
  - Phone screenshots: 1080×1920 px or larger
  - Capture: Login screen, Dashboard, Task creation, Task list with filters
- [ ] **Category**: Productivity
- [ ] **Contact details**:
  - Email: madhanitm@gmail.com
  - Website (if applicable): Your website URL
- [ ] **Privacy Policy URL**: Required - Create and host one

### ✅ Privacy Policy

**REQUIRED** - You must provide a privacy policy URL.

**Option 1: Create Privacy Policy**
- Use: https://www.freeprivacypolicy.com/
- Or: https://www.privacypolicies.com/
- Include your email: madhanitm@gmail.com
- Mention Firebase data collection
- Host on: Your website, GitHub Pages, or free hosting

**Option 2: Quick Privacy Policy Content** (for hosting):

```
Privacy Policy for TaskFlow

Last updated: [Today's Date]

Contact Information:
Email: madhanitm@gmail.com

Data Collection:
TaskFlow collects and stores the following data:
- Email address and authentication data (via Firebase Authentication)
- Task data (titles, descriptions, due dates, categories, priorities)
- App usage analytics (anonymous)

Data Usage:
- Task data is stored securely in Firebase Firestore
- Authentication is handled by Google Firebase
- Data is used solely for app functionality
- We do not share your personal data with third parties

Data Security:
- All data is transmitted over HTTPS
- Firebase follows industry-standard security practices
- Your data is encrypted in transit and at rest

User Rights:
- You can access your data through the app
- You can delete your account and data at any time
- Contact madhanitm@gmail.com for data requests

Data Retention:
- Your data is retained until you delete your account
- You can delete individual tasks at any time

Changes to Privacy Policy:
We may update this policy from time to time. Changes will be posted in the app.
```

- [ ] Privacy policy created
- [ ] Privacy policy hosted and accessible via URL
- [ ] URL added to Play Console

### ✅ Content Rating

Navigate to: **Policy → App content**

- [ ] Complete content rating questionnaire
- [ ] Answer questions about app content
- [ ] Get rating certificate (usually "Everyone")

### ✅ Data Safety

Navigate to: **Policy → Data safety**

Fill out:
- [ ] What data do you collect? (Authentication data, task data)
- [ ] Why do you collect it? (App functionality)
- [ ] How is data encrypted? (HTTPS, Firebase encryption)
- [ ] Do you share data? (No, only with Firebase services)

### ✅ App Access

Navigate to: **App access**

- [ ] Select: "All Google Play users" (for public release)
- [ ] Or select restricted access if needed

## Upload & Release

### ✅ Prepare Release

1. Navigate to: **Production → Create new release**
2. Upload file:
   - [ ] Select: `android/app/build/outputs/bundle/release/app-release.aab`
   - [ ] File uploaded successfully

3. Release details:
   - [ ] **Release name**: 1.0
   - [ ] **Release notes**:
     ```
     Initial release of TaskFlow
     
     Features:
     - Task management with categories and priorities
     - Due date tracking
     - Real-time sync across devices
     - Secure authentication
     - Search and filtering
     ```
   - [ ] Review all details

4. Review:
   - [ ] All required sections completed
   - [ ] Store listing complete
   - [ ] Privacy policy added
   - [ ] Content rating complete
   - [ ] App access configured

### ✅ Submit for Review

- [ ] Click **"Start rollout to Production"**
- [ ] Review summary
- [ ] Confirm submission
- [ ] Wait for review (usually 1-3 days)

## Post-Deployment

### ✅ Monitor Review

- [ ] Check Play Console regularly for status updates
- [ ] Respond to any reviewer questions promptly
- [ ] Fix any issues if app is rejected

### ✅ After Approval

- [ ] App is live on Google Play Store
- [ ] Share Play Store link
- [ ] Monitor user reviews
- [ ] Monitor crash reports (if enabled)

## Future Updates

For future versions:

1. Update `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment
   versionName "1.0.1"  // Update
   ```

2. Build and sync:
   ```bash
   npm run build
   npx cap sync android
   ```

3. Build new release:
   ```bash
   npm run android:build
   ```

4. Upload to Play Console:
   - Production → Create new release
   - Upload new `.aab` file
   - Add release notes
   - Roll out

## Quick Commands Reference

```bash
# Build and sync
npm run cap:sync

# Build release bundle
npm run android:build

# Build test APK
npm run android:build-apk

# Open in Android Studio
npm run cap:open
```

## Contact Information

**Developer Account**: madhanitm@gmail.com
**App ID**: com.taskflow.app
**Firebase Project**: claude-project-10b09

---

**Ready to publish? Start with the account setup and work through each section!**

