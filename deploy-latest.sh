#!/bin/bash

echo "🚀 Automated Deployment Script"
echo "=============================="
echo ""

# Change to project directory
echo "📂 Navigating to project directory..."
cd "/Users/madhanbaskaran/Documents/Claude and Cursor Project" || exit 1

# Pull latest changes
echo "⬇️  Pulling latest changes from GitHub..."
git pull origin claude/field-service-prd-011CV1NrdRUasxDwzW4qQ15r

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull latest changes"
    exit 1
fi

echo ""
echo "✅ Latest changes pulled successfully!"
echo ""

# Change to field-service-app directory
echo "📂 Changing to field-service-app directory..."
cd field-service-app || exit 1

# Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
echo ""
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Your app is live at: https://claude-project-10b09.web.app"
    echo ""
    echo "⚠️  IMPORTANT: Clear your browser cache to see the changes!"
    echo "   Press Cmd+Shift+Delete and select 'All time'"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
