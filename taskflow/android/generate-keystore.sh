#!/bin/bash

# TaskFlow - Keystore Generation Script
# This script generates a keystore file for signing your Android app for Google Play Store

echo "🔐 TaskFlow - Keystore Generation Script"
echo "========================================"
echo ""
echo "This will generate a keystore file for signing your Android app."
echo "⚠️  IMPORTANT: Keep this keystore file and password safe!"
echo "   You'll need it for all future app updates on Google Play Store."
echo ""

# Navigate to android/app directory
cd "$(dirname "$0")/app" || exit 1

KEYSTORE_FILE="taskflow-release-key.jks"
KEY_ALIAS="taskflow-key"

# Check if keystore already exists
if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  Keystore file already exists: $KEYSTORE_FILE"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Keystore generation cancelled."
        exit 1
    fi
    rm -f "$KEYSTORE_FILE"
fi

echo "Generating keystore..."
echo ""

# Generate keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Create a 'key.properties' file in android/app/ with:"
    echo "   storePassword=YOUR_STORE_PASSWORD"
    echo "   keyPassword=YOUR_KEY_PASSWORD"
    echo "   keyAlias=$KEY_ALIAS"
    echo "   storeFile=$(pwd)/$KEYSTORE_FILE"
    echo ""
    echo "2. Update android/app/build.gradle with signing configuration"
    echo "   (See GOOGLE_PLAY_PUBLISHING.md for details)"
    echo ""
    echo "3. Keep your keystore file and passwords secure!"
    echo "   Location: $(pwd)/$KEYSTORE_FILE"
    echo ""
    echo "⚠️  Add to .gitignore:"
    echo "   android/app/$KEYSTORE_FILE"
    echo "   android/app/key.properties"
else
    echo ""
    echo "❌ Keystore generation failed!"
    echo "   Make sure Java JDK is installed and keytool is available."
    exit 1
fi

