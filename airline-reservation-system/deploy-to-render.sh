#!/bin/bash

# Automated Render Deployment Script for Airline Backend
# This script commits changes and triggers Render deployment

set -e  # Exit on error

echo "🚀 Airline Backend - Automated Deployment Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Must run from airline-reservation-system directory"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 Found uncommitted changes. Staging files..."

    # Stage all changes in backend directory
    git add backend/
    git add test-deployment.sh 2>/dev/null || true

    # Ask for commit message
    echo ""
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG

    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update airline backend

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    else
        COMMIT_MSG="$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    fi

    echo ""
    echo "📦 Committing changes..."
    git commit -m "$COMMIT_MSG"

    echo ""
    echo "⬆️  Pushing to GitHub..."
    git push origin main

    echo ""
    echo "✅ Code pushed to GitHub!"
else
    echo "ℹ️  No uncommitted changes found."

    # Check if local is ahead of remote
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

    if [ "$LOCAL" != "$REMOTE" ] && [ -n "$REMOTE" ]; then
        echo ""
        echo "⬆️  Local commits found. Pushing to GitHub..."
        git push origin main
        echo "✅ Code pushed to GitHub!"
    else
        echo "✅ Already in sync with GitHub."
    fi
fi

echo ""
echo "🔍 Checking if RENDER_DEPLOY_HOOK_URL is configured..."

# Try to get the deploy hook from environment or git config
DEPLOY_HOOK="${RENDER_DEPLOY_HOOK_URL:-$(git config --get render.deployhook 2>/dev/null || echo '')}"

if [ -z "$DEPLOY_HOOK" ]; then
    echo ""
    echo "⚠️  RENDER_DEPLOY_HOOK_URL not found!"
    echo ""
    echo "To enable automatic deployment, you have two options:"
    echo ""
    echo "Option 1: Set it for this session:"
    echo "  export RENDER_DEPLOY_HOOK_URL='your-deploy-hook-url'"
    echo ""
    echo "Option 2: Save it in git config (recommended):"
    echo "  git config render.deployhook 'your-deploy-hook-url'"
    echo ""
    echo "To get your deploy hook URL:"
    echo "  1. Go to: https://dashboard.render.com/"
    echo "  2. Click: airline-backend-nlsk"
    echo "  3. Click: Settings → Deploy Hook"
    echo "  4. Copy the URL"
    echo ""
    echo "For now, you can manually deploy at:"
    echo "👉 https://dashboard.render.com/"
    echo ""
    exit 0
fi

echo "✅ Deploy hook configured!"
echo ""
echo "🚀 Triggering Render deployment..."

# Trigger the deploy hook
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$DEPLOY_HOOK")

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
    echo ""
    echo "✅ Deployment triggered successfully!"
    echo ""
    echo "📊 Monitor deployment:"
    echo "  Render Dashboard: https://dashboard.render.com/"
    echo "  Service: airline-backend-nlsk"
    echo ""
    echo "⏰ Deployment typically takes 5-7 minutes"
    echo ""
    echo "🧪 After deployment, test with:"
    echo "  ./test-deployment.sh"
    echo ""
else
    echo ""
    echo "❌ Failed to trigger deployment (HTTP $RESPONSE)"
    echo ""
    echo "Please manually deploy at:"
    echo "👉 https://dashboard.render.com/"
    echo ""
    exit 1
fi
