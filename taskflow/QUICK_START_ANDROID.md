# TaskFlow - Quick Start Guide for Android Publishing

This is a quick reference guide for publishing TaskFlow to Google Play Store.

## Prerequisites Checklist

- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] Android Studio installed
- [ ] Java JDK 17+ installed
- [ ] Android SDK installed (via Android Studio)

## Quick Build Commands

```bash
# 1. Build web assets
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio (optional)
npx cap open android

# 4. Generate keystore (first time only)
cd android
./generate-keystore.sh

# 5. Configure signing (first time only)
# - Copy android/app/key.properties.example to android/app/key.properties
# - Fill in your keystore details

# 6. Build release bundle
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Setup Steps (First Time)

### Step 1: Generate Keystore

```bash
cd android
./generate-keystore.sh
```

Follow the prompts to create your keystore. **Save the password securely!**

### Step 2: Configure Signing

1. Copy the example properties file:
   ```bash
   cp android/app/key.properties.example android/app/key.properties
   ```

2. Edit `android/app/key.properties` and fill in:
   - `storePassword`: Your keystore password
   - `keyPassword`: Your key password (usually same as storePassword)
   - `keyAlias`: `taskflow-key`
   - `storeFile`: Absolute path to your `.jks` file

3. Update `android/app/build.gradle` with signing configuration (see detailed guide)

### Step 3: Build Release Bundle

```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

### Step 4: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload the `.aab` file from:
   `android/app/build/outputs/bundle/release/app-release.aab`
4. Complete store listing (icons, screenshots, description)
5. Submit for review

## Useful NPM Scripts

```bash
# Build and sync
npm run cap:sync

# Open in Android Studio
npm run cap:open

# Build release bundle
npm run android:build

# Build release APK (for testing)
npm run android:build-apk
```

## Testing Before Publishing

```bash
# Build APK for testing
cd android
./gradlew assembleRelease

# Install on connected device
adb install app/build/outputs/apk/release/app-release.apk

# Or install via Android Studio
npx cap open android
# Then Run → Run 'app'
```

## Required Play Store Assets

- **App Icon**: 512×512 px PNG
- **Feature Graphic**: 1024×500 px PNG
- **Screenshots**: At least 2, up to 8 recommended (1080×1920 px or larger)
- **Privacy Policy URL**: Required (create one at freeprivacypolicy.com)

## Common Issues

**"SDK location not found"**
```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

**"Gradle sync failed"**
- Open project in Android Studio
- Click "Sync Project with Gradle Files"

**"Keystore not found"**
- Verify `key.properties` has correct absolute path
- Check keystore file exists at that location

## For More Details

See the complete guide: [GOOGLE_PLAY_PUBLISHING.md](./GOOGLE_PLAY_PUBLISHING.md)

