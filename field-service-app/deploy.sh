#!/bin/bash

echo "🚀 Deploying Field Service App to Firebase..."
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "📝 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Deploy
echo ""
echo "📦 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://claude-project-10b09.web.app"
