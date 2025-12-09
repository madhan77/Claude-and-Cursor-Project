# 🚀 Quick Access Guide - All New Features

## ✅ Servers Running

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000 (37 tables, all APIs ready)

---

## 🎯 How to Access Each Feature

### 1. ✅ **Online Check-In**
**URL:** http://localhost:3000/checkin

**How to test:**
1. Navigate to http://localhost:3000/checkin
2. Enter any PNR from your bookings (e.g., if you have a booking, use its PNR)
3. Click "Find Booking"
4. See passenger list with check-in status
5. Click "Check In" button (works 24 hours before departure)
6. View boarding pass with barcode

**Features you'll see:**
- PNR lookup form
- Passenger list
- Check-in button (with 24-hour window validation)
- Boarding pass modal
- Gate, terminal, boarding group info
- Print boarding pass option

---

### 2. ✅ **Loyalty Programs**
**URL:** http://localhost:3000/loyalty

**How to test:**
1. Login first at http://localhost:3000/login
2. Navigate to http://localhost:3000/loyalty
3. See available loyalty programs
4. Click "Enroll Now" to join a program
5. View your membership cards, points balance, and tier
6. See transaction history

**Features you'll see:**
- 5 airline loyalty programs (AA, UA, DL, BA, EK)
- 4-tier system (Blue, Silver, Gold, Platinum)
- Points balance display
- Tier benefits (Priority Boarding, Lounge Access, Extra Baggage)
- Transaction history table
- Enroll button for new programs

---

### 3. ✅ **Promo Codes** (Integrated in Booking Flow!)
**Available codes to test:**
- `WELCOME10` - 10% off (min $100)
- `SUMMER25` - 25% off (min $200)
- `FLAT50` - $50 off (min $300)
- `BUSINESS20` - 20% off (min $500)
- `EARLYBIRD` - $75 off (min $400)

**How to test:**
1. Start a booking at http://localhost:3000
2. Search for flights
3. Select a flight and proceed to booking
4. **NEW!** You'll see the Promo Code section in the booking flow
5. Enter any of the codes above
6. Watch the discount apply in real-time!
7. See the updated total price with discount

**Features:**
- ✅ Integrated into BookingFlow
- ✅ Real-time validation
- ✅ Show available codes
- ✅ Discount calculation in price summary
- ✅ Visual success/error feedback

---

### 4. ✅ **Seat Selection, Baggage, Meals, Insurance**
**Components available after booking**

These features are fully functional and can be accessed from your booking confirmation page:
- `SeatSelection.tsx` - Visual seat map
- `BaggageSelection.tsx` - Baggage quantity selector
- `MealSelection.tsx` - Meal preferences with dietary filters
- `InsuranceSelection.tsx` - 3-tier insurance plans

**How it works:**
1. Complete your booking with the basic flight details
2. After booking confirmation, you can add these extras:
   - Select specific seats for each passenger
   - Add baggage allowances
   - Choose meal preferences
   - Purchase travel insurance
3. These will be saved to your booking and reflected in the total price

---

## 🧪 Quick API Tests

### Test Promo Code
```bash
curl -X POST http://localhost:5000/api/v1/promo/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "SUMMER25", "bookingAmount": 500}'
```

### Test Get Active Promo Codes
```bash
curl http://localhost:5000/api/v1/promo/active
```

### Test Get Baggage Options
```bash
curl http://localhost:5000/api/v1/ancillary/baggage/options
```

### Test Get Meal Options
```bash
curl http://localhost:5000/api/v1/ancillary/meals/options
```

### Test Get Insurance Products
```bash
curl http://localhost:5000/api/v1/ancillary/insurance/products
```

### Test Get Loyalty Programs
```bash
curl http://localhost:5000/api/v1/loyalty/programs
```

---

## 📱 Navigation Links Added

Check your header navigation at http://localhost:3000:
- **Home** - Main page
- **Check-In** - Online check-in page ✅ NEW
- **My Bookings** - Your bookings (when logged in)
- **Loyalty** - Loyalty dashboard ✅ NEW (when logged in)

---

## 🎯 What's Currently Visible

### ✅ Fully Functional Pages:
1. **Check-In Page** - http://localhost:3000/checkin
2. **Loyalty Dashboard** - http://localhost:3000/loyalty (requires login)
3. **Booking Flow with Promo Codes** - http://localhost:3000 (select flights to see)

### ✅ Integrated Features:
- ✅ **Promo Code Input** - Now in BookingFlow! Apply discounts before completing your booking
- ✅ **Check-In System** - Complete standalone page
- ✅ **Loyalty Programs** - Complete dashboard with enrollment

### ✅ Post-Booking Features (Add after booking):
- SeatSelection - Add from booking confirmation page
- BaggageSelection - Add from booking confirmation page
- MealSelection - Add from booking confirmation page
- InsuranceSelection - Add from booking confirmation page

---

## 🎉 Latest Updates

**Just Integrated:**
- ✅ Promo codes are now part of the booking flow!
- ✅ Real-time discount calculation during booking
- ✅ Price summary shows applied discounts
- ✅ Clean UI with helpful info about post-booking options

**How the booking flow works now:**
1. Search and select flights
2. Enter passenger details
3. **Apply promo code (NEW!)** - Get instant discounts
4. Review price summary with discount applied
5. Complete booking
6. After booking: Add seats, meals, baggage, and insurance from confirmation page

---

## 💡 Quick Test Checklist

- [ ] Visit http://localhost:3000/checkin
- [ ] Try entering a PNR or booking reference
- [ ] Visit http://localhost:3000/loyalty (after login)
- [ ] Enroll in a loyalty program
- [ ] Check the header navigation for new links
- [ ] Test promo code API endpoint
- [ ] Test baggage/meals/insurance API endpoints
- [ ] **NEW!** Test promo code in booking flow
- [ ] Create a booking and apply a promo code

---

## 🚀 What You Can Do Now

**Immediate Testing:**
1. **Book a flight with promo code** - http://localhost:3000
   - Search flights → Select → Enter passenger details → Apply SUMMER25 → Complete booking
2. **Check in online** - http://localhost:3000/checkin
   - Use your booking PNR to check in
3. **Join loyalty program** - http://localhost:3000/loyalty
   - Login and enroll in any program

**After Booking:**
- View your booking details
- Add seats, meals, baggage, and insurance to your existing bookings
