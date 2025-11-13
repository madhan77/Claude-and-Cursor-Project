#!/bin/bash

# Firestore Rules and Indexes Deployment Script
# This script deploys Firestore security rules and indexes

echo "🚀 Starting Firestore deployment..."
echo ""

# Check if firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
echo "📝 Checking Firebase authentication..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase. Running login..."
    firebase login
fi

# Deploy Firestore rules
echo ""
echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Firestore indexes
echo ""
echo "🗂️  Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi

echo ""
echo "🎉 All done! Your Firestore rules and indexes are now live."
echo ""
echo "⚠️  Note: Indexes may take several minutes to build."
echo "   You can check the status in the Firebase Console:"
echo "   https://console.firebase.google.com/project/claude-project-10b09/firestore/indexes"
