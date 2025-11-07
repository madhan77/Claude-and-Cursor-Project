# TaskFlow - Google Play Store Publishing Guide

This guide will walk you through the complete process of publishing TaskFlow to the Google Play Store.

> **📌 Account-Specific Guides**
> - **Account Setup**: See [ACCOUNT_SETUP.md](./ACCOUNT_SETUP.md) for setup specific to **madhanitm@gmail.com**
> - **Deployment Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a step-by-step checklist with your account details
> - **Quick Start**: See [QUICK_START_ANDROID.md](./QUICK_START_ANDROID.md) for a quick reference

## Prerequisites

Before you begin, ensure you have:

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console/signup
   - Provide payment information and complete account verification

2. **Android Studio** (for building the app)
   - Download from: https://developer.android.com/studio
   - Install Android SDK, build tools, and Gradle

3. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/

## Step 1: Prepare Your Development Environment

### Install Required Tools

```bash
# Ensure Android Studio is installed
# Check Java version
java -version  # Should be 17 or higher

# Install Android SDK if not already installed
# Open Android Studio → SDK Manager → Install:
# - Android SDK Platform-Tools
# - Android SDK Build-Tools
# - Android SDK Platform (API 34 or higher)
```

### Set Environment Variables

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## Step 2: Build the Production App

### 2.1 Build Web Assets

```bash
cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/taskflow"
npm run build
```

### 2.2 Sync with Capacitor

```bash
npx cap sync android
```

This command will:
- Copy your web assets to the Android project
- Update native dependencies
- Sync configuration files

## Step 3: Configure App Metadata

### 3.1 Update App Version

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.taskflow.app"
    versionCode 1          // Increment this for each release
    versionName "1.0.0"    // User-visible version
    // ... rest of config
}
```

**Version Code**: Integer that must increase with each release (1, 2, 3, ...)
**Version Name**: User-visible version string (e.g., "1.0.0", "1.1.0", "2.0.0")

### 3.2 Generate App Icons

You need to create app icons in these sizes:
- **Icon**: 512×512 px (for Play Store)
- **Adaptive Icon**: 1024×1024 px (foreground), 1024×1024 px (background)

**Quick Icon Generation:**
1. Create a 1024×1024 px PNG with your app logo
2. Use online tools:
   - https://icon.kitchen/
   - https://www.appicon.co/
   - Or Android Studio's Image Asset Studio

**Place Icons:**
- Play Store Icon: 512×512 px → Upload directly to Play Console
- App Icons: Replace files in `android/app/src/main/res/mipmap-*/` directories

**Using Android Studio Image Asset Studio:**
1. Open Android Studio
2. Right-click `android/app/src/main/res` → New → Image Asset
3. Configure your icon
4. Generate all densities automatically

### 3.3 Add App Icons to Android Project

Replace the default icons in these directories:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48×48)
│   └── ic_launcher_round.png (48×48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72×72)
│   └── ic_launcher_round.png (72×72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96×96)
│   └── ic_launcher_round.png (96×96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144×144)
│   └── ic_launcher_round.png (144×144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192×192)
    └── ic_launcher_round.png (192×192)
```

## Step 4: Configure App Signing

### 4.1 Generate a Keystore (First Time Only)

**IMPORTANT**: Keep this keystore file safe! You'll need it for all future updates.

```bash
cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/taskflow/android/app"
keytool -genkey -v -keystore taskflow-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias taskflow-key
```

When prompted, enter:
- **Password**: Create a strong password (save it securely!)
- **Name/Organization**: Your details
- **Validity**: 10000 days (recommended)

**Store your keystore safely:**
- Save the `.jks` file in a secure location (NOT in git!)
- Keep a backup
- Save the password in a password manager

### 4.2 Configure Signing in Gradle

Create or edit `android/app/key.properties` (add to `.gitignore`):

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=taskflow-key
storeFile=/absolute/path/to/taskflow-release-key.jks
```

**Update `.gitignore`**:
```
android/app/key.properties
android/app/*.jks
*.jks
```

**Update `android/app/build.gradle`**:

Add at the top of the file:

```gradle
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Update the `android` block:

```gradle
android {
    // ... existing config ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 5: Build the Release APK/AAB

### Option A: Build App Bundle (AAB) - Recommended for Play Store

```bash
cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/taskflow/android"
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Option B: Build APK (for testing)

```bash
cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project/taskflow/android"
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

**Test the APK first:**
```bash
# Install on connected device or emulator
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Step 6: Prepare Play Store Assets

Before submitting, prepare:

### 6.1 Required Assets

1. **App Icon**: 512×512 px PNG (no transparency)
2. **Feature Graphic**: 1024×500 px PNG (Play Store banner)
3. **Screenshots**: At least 2 (up to 8 recommended)
   - Phone: 1080×1920 px or larger
   - Tablet (if supported): 1200×1920 px or larger
4. **Promotional Video** (optional): YouTube link

### 6.2 App Information

- **App Name**: TaskFlow (or TaskFlow - Task Management)
- **Short Description**: 80 characters max
  - Example: "Manage tasks efficiently with categories, priorities, and due dates"
- **Full Description**: 4000 characters max
  - See template below
- **Privacy Policy URL**: Required (create one if you don't have it)

### 6.3 Privacy Policy

You need a privacy policy that covers:
- What data you collect (Firebase Auth, Firestore data)
- How you use the data
- Data security measures
- User rights

**Quick Privacy Policy Generator:**
- https://www.freeprivacypolicy.com/
- https://www.privacypolicies.com/

**Example Privacy Policy Content:**
```
TaskFlow Privacy Policy

Data Collection:
- Email address and authentication data (via Firebase Authentication)
- Task data stored locally in your Firebase account
- App usage analytics (anonymous)

Data Usage:
- Task data is stored securely in Firebase Firestore
- Authentication is handled by Google Firebase
- We do not share your data with third parties

Data Security:
- All data transmitted over HTTPS
- Firebase follows industry-standard security practices
```

Host this on your website or GitHub Pages.

## Step 7: Create App in Play Console

### 7.1 Access Play Console

1. Go to: https://play.google.com/console
2. Click "Create app"

### 7.2 Fill App Details

- **App name**: TaskFlow
- **Default language**: English (United States)
- **App or game**: App
- **Free or paid**: Free
- **Declarations**: Accept required declarations

### 7.3 Complete Store Listing

Navigate to **Store presence → Main store listing**

Fill in:
- **App name**: TaskFlow
- **Short description**: Brief 80-char description
- **Full description**: Detailed app description
- **App icon**: Upload 512×512 px icon
- **Feature graphic**: Upload 1024×500 px banner
- **Screenshots**: Upload 2-8 screenshots
- **Category**: Productivity (or appropriate category)
- **Contact details**: Your email and website

### 7.4 Set Up Content Rating

Navigate to **Policy → App content**

Complete the content rating questionnaire:
- Does your app contain sensitive content? (Usually "No" for task management apps)
- Follow the questionnaire and get your rating

### 7.5 Set Up Privacy Policy

Navigate to **Policy → Privacy policy**

- Enter your privacy policy URL
- Complete data safety section if required

### 7.6 Configure App Access

Navigate to **App access**

- Select if your app is available to all users or restricted

## Step 8: Upload Your App

### 8.1 Create Production Release

1. Navigate to **Production** in the left menu
2. Click **Create new release**
3. Upload your `.aab` file (app-release.aab)
4. Enter **Release name**: "1.0.0" (should match versionName)
5. Enter **Release notes**:
   ```
   Initial release of TaskFlow
   - Task management with categories and priorities
   - Due date tracking
   - Real-time sync across devices
   - Secure authentication
   ```
6. Click **Review release**

### 8.2 Review and Roll Out

1. Review all information
2. Click **Start rollout to Production**
3. Your app will be submitted for review

## Step 9: App Review Process

### Timeline
- **Initial review**: Usually 1-3 days
- **Updates**: Usually within a few hours

### Common Rejection Reasons

- Missing privacy policy
- Incomplete store listing
- App crashes or errors
- Violation of content policies
- Missing required permissions justification

### After Approval

- Your app will be live on Google Play Store
- Users can download and install
- You'll receive notifications for any issues

## Step 10: Maintain and Update

### For Future Updates

1. **Increment version** in `build.gradle`:
   ```gradle
   versionCode 2  // Increment
   versionName "1.0.1"  // Update
   ```

2. **Build and sync**:
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Build new release**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

4. **Upload to Play Console**:
   - Go to Production → Create new release
   - Upload new `.aab` file
   - Add release notes
   - Roll out

## Troubleshooting

### Build Errors

**"SDK location not found"**
```bash
# Create local.properties in android/
echo "sdk.dir=/Users/madhanbaskaran/Library/Android/sdk" > android/local.properties
```

**"Gradle sync failed"**
- Open project in Android Studio
- Click "Sync Project with Gradle Files"
- Wait for sync to complete

**"Keystore not found"**
- Verify `key.properties` path is absolute
- Check keystore file exists
- Verify passwords are correct

### App Crashes

- Test APK before uploading AAB
- Check Logcat in Android Studio
- Verify Firebase configuration is correct
- Test on multiple Android versions

### Play Console Issues

**"App not eligible"**
- Complete all required sections
- Fix any policy violations
- Ensure privacy policy is accessible

**"Upload failed"**
- Verify AAB file size (max 150 MB for free apps)
- Check version code is higher than previous
- Ensure signing is correct

## Quick Reference Commands

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Build release bundle
cd android && ./gradlew bundleRelease

# Build release APK
cd android && ./gradlew assembleRelease

# Open in Android Studio
npx cap open android

# Test APK on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Firebase for Android](https://firebase.google.com/docs/android/setup)

## Support

If you encounter issues:
1. Check Capacitor documentation
2. Review Android Studio logs
3. Test on Android emulator first
4. Verify all configurations match this guide

---

**Good luck with your publication! 🚀**

