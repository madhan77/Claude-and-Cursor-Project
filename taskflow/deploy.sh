#!/bin/bash

# TaskFlow Deployment Script
# This script will build and deploy your app to Firebase Hosting

echo "🚀 Starting TaskFlow deployment..."
echo ""

# Step 1: Build the production app
echo "📦 Building production app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
npx firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live at: https://claude-project-10b09.web.app"
    echo "🌐 Or: https://claude-project-10b09.firebaseapp.com"
else
    echo "❌ Deployment failed! Make sure you're logged in to Firebase."
    echo "💡 Run: npx firebase login"
fi
