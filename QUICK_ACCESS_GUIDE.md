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

### 3. ✅ **Promo Codes** (In Booking Flow)
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
4. Look for the PromoCode component (if integrated in BookingFlow)
5. Or test the API directly:
   ```bash
   curl -X POST http://localhost:5000/api/v1/promo/validate \
     -H "Content-Type: application/json" \
     -d '{"code": "SUMMER25", "bookingAmount": 500}'
   ```

**Features:**
- Real-time validation
- Show available codes
- Discount calculation
- Visual success/error feedback

---

### 4. 🔧 **Seat Selection, Baggage, Meals, Insurance**
**Components created but need integration into BookingFlow**

These components are ready to use:
- `SeatSelection.tsx` - Visual seat map
- `BaggageSelection.tsx` - Baggage quantity selector
- `MealSelection.tsx` - Meal preferences with dietary filters
- `InsuranceSelection.tsx` - 3-tier insurance plans

**To see them working:**
You would need to integrate them into the BookingFlow component. I can do this now if you'd like!

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

### ✅ Components Ready (Need BookingFlow Integration):
3. PromoCodeInput
4. SeatSelection
5. BaggageSelection
6. MealSelection
7. InsuranceSelection

---

## 🔧 Integration Needed

To see **ALL** features in the booking flow, I need to:
1. Update `BookingFlow.tsx` to include the new components
2. Add them as steps after passenger information
3. Collect the data for final booking submission

**Would you like me to integrate these into the BookingFlow now?**

This would allow you to:
- Select seats during booking
- Add baggage during booking
- Choose meals during booking
- Purchase insurance during booking
- Apply promo codes during booking

All in one seamless flow!

---

## 💡 Quick Test Checklist

- [ ] Visit http://localhost:3000/checkin
- [ ] Try entering a PNR or booking reference
- [ ] Visit http://localhost:3000/loyalty (after login)
- [ ] Enroll in a loyalty program
- [ ] Check the header navigation for new links
- [ ] Test promo code API endpoint
- [ ] Test baggage/meals/insurance API endpoints

---

## 🚀 Ready to See More?

Say "yes" and I'll:
1. Integrate all components into BookingFlow
2. Make the complete booking experience with all features
3. Test end-to-end booking with seats, baggage, meals, insurance, and promo codes

Or you can explore what's already live at:
- http://localhost:3000/checkin
- http://localhost:3000/loyalty
