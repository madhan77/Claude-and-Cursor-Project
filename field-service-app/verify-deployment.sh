#!/bin/bash

echo "🔍 Field Service App - Deployment Verification"
echo "=============================================="
echo ""

# Check files that should be deployed
echo "📁 Files ready for deployment:"
echo ""
ls -lh index.html app.js styles.css data.js firebase.json .firebaserc 2>/dev/null

echo ""
echo "📊 File sizes:"
echo "   index.html: $(wc -l < index.html) lines"
echo "   app.js: $(wc -l < app.js) lines"
echo "   styles.css: $(wc -l < styles.css) lines"

echo ""
echo "🔍 Checking for premium features in index.html:"
grep -q "FieldService PRO" index.html && echo "   ✅ FieldService PRO branding found" || echo "   ❌ Missing PRO branding"
grep -q "globalSearchOverlay" index.html && echo "   ✅ Global Search found" || echo "   ❌ Missing Global Search"
grep -q "signature_pad" index.html && echo "   ✅ Signature Pad found" || echo "   ❌ Missing Signature Pad"

echo ""
echo "🔍 Checking for premium features in app.js:"
grep -q "class VoiceControl" app.js && echo "   ✅ Voice Control class found" || echo "   ❌ Missing Voice Control"
grep -q "performGlobalSearch" app.js && echo "   ✅ Global Search function found" || echo "   ❌ Missing Global Search"
grep -q "clockIn" app.js && echo "   ✅ Time Tracking found" || echo "   ❌ Missing Time Tracking"

echo ""
echo "🚀 To deploy these files to Firebase, run:"
echo "   firebase login"
echo "   firebase deploy --only hosting"
echo ""
echo "⚠️  Note: Firebase has 1-hour caching enabled."
echo "   After deployment, use Ctrl+Shift+Delete to clear browser cache completely."
