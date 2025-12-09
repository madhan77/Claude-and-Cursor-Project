#!/bin/bash

echo "🧪 Testing Deployed Airline Backend"
echo "===================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
echo "--------------------------------"
curl -s https://airline-backend-nlsk.onrender.com/health | jq '.'
echo ""
echo ""

# Test 2: Booking Endpoint (should show detailed error now)
echo "2️⃣ Testing Booking Endpoint (AL0KLL)..."
echo "--------------------------------"
curl -s https://airline-backend-nlsk.onrender.com/api/v1/bookings/AL0KLL | jq '.'
echo ""
echo ""

# Test 3: Another test booking
echo "3️⃣ Testing Another Booking (TEST123)..."
echo "--------------------------------"
curl -s https://airline-backend-nlsk.onrender.com/api/v1/bookings/TEST123 | jq '.'
echo ""
echo ""

echo "✅ Testing Complete!"
echo ""
echo "📊 What to Look For:"
echo "  - Health endpoint should return success: true"
echo "  - Booking endpoints should show DETAILED errors (not generic 500)"
echo "  - You should see either:"
echo "    • 'Booking not found' (if booking doesn't exist)"
echo "    • 'Database query failed' (with specific DB error)"
echo "    • Actual booking data (if it exists)"
echo ""
echo "🔍 Next Steps:"
echo "  - If you see detailed errors: ✅ Fix is working!"
echo "  - If you still see 'Internal server error': ❌ Deployment may not be complete yet"
echo ""
