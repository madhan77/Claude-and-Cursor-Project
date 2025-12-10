# Frontend Features Implementation Guide

This document provides a comprehensive guide for implementing all 12 new features in the frontend UI.

## ✅ Completed

### 1. API Service Extension
**File:** `src/services/api.ts`

All backend endpoints have been integrated into the ApiService class:
- ✅ Promo code validation and listing
- ✅ Seat selection and seat maps
- ✅ Baggage options and booking
- ✅ Meal options and selection
- ✅ Insurance products and purchase
- ✅ Online check-in and boarding passes
- ✅ Loyalty programs and membership

### 2. PromoCode Component
**File:** `src/components/PromoCodeInput.tsx`

**Features:**
- Real-time promo code validation
- Display available active promo codes
- Show discount calculation
- Remove applied promo codes
- Visual feedback with success/error states

**Usage:**
```tsx
<PromoCodeInput
  bookingAmount={totalAmount}
  onPromoApplied={(discount, promoId, code) => {
    setDiscount(discount);
    setAppliedPromoCode(code);
  }}
  airlineCode={flight.airlineCode}
  classType="economy"
/>
```

## 📋 Implementation Guide for Remaining Features

### 3. Seat Selection Component

**Create:** `src/components/SeatSelection.tsx`

**Key Features:**
- Visual seat map grid (rows x columns)
- Color-coded seats (available, selected, taken, premium)
- Click to select/deselect seats
- Show seat prices (exit row, window, aisle)
- Real-time seat availability

**Sample Implementation:**
```tsx
import { useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

export default function SeatSelection({ flightId, passengerId, bookingId, onSeatSelected }) {
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeatMap();
  }, [flightId]);

  const loadSeatMap = async () => {
    try {
      const result = await apiService.getFlightSeatMap(flightId);
      setSeatMap(result.seatMap);
    } catch (error) {
      toast.error('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    if (seat.is_selected && seat.passenger_id !== passengerId) {
      toast.error('Seat already taken');
      return;
    }

    try {
      await apiService.selectSeat(bookingId, passengerId, flightId, seat.seat_number);
      setSelectedSeat(seat);
      onSeatSelected(seat.seat_number, seat.extra_price);
      toast.success(`Seat ${seat.seat_number} selected`);
      loadSeatMap(); // Refresh
    } catch (error) {
      toast.error('Failed to select seat');
    }
  };

  // Group seats by row
  const seatsByRow = seatMap.reduce((acc, seat) => {
    if (!acc[seat.row_number]) acc[seat.row_number] = [];
    acc[seat.row_number].push(seat);
    return acc;
  }, {});

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Select Your Seat</h3>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-300 rounded"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
          <span>Premium (+$)</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {Object.entries(seatsByRow).map(([row, seats]) => (
            <div key={row} className="flex gap-1 mb-1">
              <div className="w-8 text-sm text-gray-500 flex items-center">{row}</div>
              {seats.sort((a, b) => a.column_letter.localeCompare(b.column_letter)).map((seat) => {
                const isSelected = selectedSeat?.seat_number === seat.seat_number;
                const isTaken = seat.is_selected && seat.passenger_id !== passengerId;
                const isPremium = parseFloat(seat.extra_price) > 0;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    disabled={isTaken}
                    className={`
                      w-10 h-10 rounded text-xs font-medium
                      ${isTaken ? 'bg-red-300 cursor-not-allowed' :
                        isSelected ? 'bg-blue-500 text-white' :
                        isPremium ? 'bg-yellow-200 border-2 border-yellow-500 hover:bg-yellow-300' :
                        'bg-gray-200 hover:bg-gray-300'}
                    `}
                    title={`${seat.seat_number} - ${seat.type}${isPremium ? ` (+$${seat.extra_price})` : ''}`}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
              {/* Aisle gap after C column */}
              {row.includes('C') && <div className="w-4"></div>}
            </div>
          ))}
        </div>
      </div>

      {selectedSeat && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="font-medium">Selected: {selectedSeat.seat_number}</p>
          <p className="text-sm text-gray-600">Type: {selectedSeat.type}</p>
          {parseFloat(selectedSeat.extra_price) > 0 && (
            <p className="text-sm text-gray-600">Extra charge: ${selectedSeat.extra_price}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4. Baggage Selection Component

**Create:** `src/components/BaggageSelection.tsx`

**Features:**
- List baggage options by type (carry-on, checked, oversized, sports)
- Show weight limits and prices
- Quantity selectors
- Special notes input

**Integration Points:**
- Call `apiService.getBaggageOptions(airlineCode)`
- Call `apiService.addBaggage(bookingId, passengerId, optionId, quantity)`

### 5. Meal Selection Component

**Create:** `src/components/MealSelection.tsx`

**Features:**
- Filter by dietary type (vegetarian, vegan, halal, kosher, gluten-free)
- Display meal images and descriptions
- Allergen information
- Special requests input

**Integration Points:**
- Call `apiService.getMealOptions(airlineCode, dietaryType)`
- Call `apiService.addMeal(bookingId, passengerId, flightId, mealId, quantity)`

### 6. Insurance Selection Component

**Create:** `src/components/InsuranceSelection.tsx`

**Features:**
- Display 3 insurance tiers with coverage details
- Show coverage amounts and prices
- Terms and conditions links
- Coverage date selection

**Integration Points:**
- Call `apiService.getInsuranceProducts()`
- Call `apiService.addInsurance(bookingId, passengerId, productId, startDate, endDate)`

### 7. Check-In Page

**Create:** `src/pages/CheckIn.tsx`

**Features:**
- PNR / booking reference lookup
- List passengers with check-in status
- Perform online check-in 24 hours before departure
- Generate and display boarding passes with QR codes
- Show gate, terminal, boarding time

**Integration Points:**
- Call `apiService.getCheckinStatus(bookingId)`
- Call `apiService.performOnlineCheckin(bookingId, passengerId, flightId)`
- Call `apiService.getBoardingPass(passengerId, flightId)`

**Route:** Add to `App.tsx`:
```tsx
<Route path="/checkin" element={<CheckIn />} />
<Route path="/checkin/:pnr" element={<CheckIn />} />
```

### 8. Loyalty Dashboard

**Create:** `src/pages/LoyaltyDashboard.tsx`

**Features:**
- Display user's loyalty memberships
- Show points balance and tier status
- List tier benefits (lounge access, extra baggage, etc.)
- Transaction history
- Enroll in new programs

**Integration Points:**
- Call `apiService.getLoyaltyPrograms()`
- Call `apiService.getMyMemberships()`
- Call `apiService.enrollInLoyaltyProgram(programId)`
- Call `apiService.getLoyaltyTransactions(membershipId)`

**Route:** Add to `App.tsx`:
```tsx
<Route path="/loyalty" element={<LoyaltyDashboard />} />
```

### 9. Update BookingFlow

**File:** `src/pages/BookingFlow.tsx`

**Add these sections in order:**

1. **Passenger Information** (existing)
2. **Seat Selection** (new)
   ```tsx
   {passengers.map((passenger, idx) => (
     <SeatSelection
       key={idx}
       flightId={selectedFlights[0].id}
       passengerId={tempPassengerIds[idx]}
       bookingId={tempBookingId}
       onSeatSelected={(seatNumber, extraCharge) => {
         // Update passenger seat and add charge to total
       }}
     />
   ))}
   ```

3. **Baggage Selection** (new)
4. **Meal Preferences** (new)
5. **Travel Insurance** (new)
6. **Promo Code** (completed)
7. **Payment Summary**

### 10. Booking Confirmation Enhancements

**File:** `src/pages/BookingConfirmation.tsx`

**Add:**
- Check-in button (24 hours before departure)
- Seat assignments display
- Baggage allowance summary
- Meal preferences confirmation
- Insurance policy details
- Loyalty points earned

### 11. My Bookings Enhancements

**File:** `src/pages/MyBookings.tsx`

**Add:**
- Quick check-in button
- View boarding pass button
- Seat change option
- Add baggage/meals option
- View full ancillaries

## 🎨 Styling Tips

All components use Tailwind CSS classes. Key utility classes:

- **Cards:** `card` (custom class defined in index.css)
- **Buttons:** `btn-primary`, `btn-secondary`
- **Inputs:** `input`
- **Colors:** Use primary-600, gray-200, green-50, etc.
- **Spacing:** Use `gap-4`, `space-y-6`, `p-4`, `mb-8`

## 🧪 Testing Checklist

- [ ] Promo code validation works
- [ ] Seat selection updates correctly
- [ ] Baggage selection calculates prices
- [ ] Meal preferences save properly
- [ ] Insurance purchase flow completes
- [ ] Check-in only works 24 hours before
- [ ] Boarding pass displays correctly
- [ ] Loyalty points display accurately
- [ ] All features work on mobile viewport
- [ ] Error handling shows user-friendly messages

## 🚀 Deployment

After implementing all features:

1. Build frontend: `npm run build`
2. Test production build locally
3. Deploy to Render/Vercel/Netlify
4. Update VITE_API_URL to production backend URL
5. Test all features in production

## 📝 API Response Examples

### Promo Code Validation
```json
{
  "success": true,
  "message": "Promo code is valid",
  "promoCode": {
    "id": "uuid",
    "code": "SUMMER25",
    "description": "Summer sale - 25% off"
  },
  "calculation": {
    "originalAmount": "500.00",
    "discountAmount": "100.00",
    "finalAmount": "400.00"
  }
}
```

### Seat Map Response
```json
{
  "success": true,
  "flight": {
    "id": "uuid",
    "flight_number": "AA123",
    "aircraft_model": "Boeing 737"
  },
  "seatMap": [
    {
      "id": "uuid",
      "seat_number": "1A",
      "row_number": 1,
      "column_letter": "A",
      "class": "first",
      "type": "window",
      "extra_price": "0.00",
      "is_selected": false,
      "is_available_for_selection": true
    }
  ]
}
```

### Boarding Pass Response
```json
{
  "success": true,
  "boardingPass": {
    "id": "uuid",
    "boarding_pass_number": "1AA123456",
    "barcode": "BP1234567890",
    "seat_number": "12A",
    "boarding_group": "B",
    "boarding_time": "2025-12-06T10:30:00Z",
    "gate": "A5",
    "terminal": "1",
    "first_name": "John",
    "last_name": "Doe",
    "pnr": "ABC123",
    "flight_number": "AA123"
  }
}
```

## 💡 Implementation Priority

If implementing in phases, prioritize in this order:

1. **Phase 1 (Core Booking Enhancements):**
   - ✅ Promo Codes (completed)
   - Seat Selection
   - Baggage & Meals

2. **Phase 2 (Value-Added Services):**
   - Insurance
   - Check-in
   - Loyalty Program

3. **Phase 3 (Advanced Features):**
   - Multi-city flights
   - Group booking
   - Special assistance
   - Price alerts

## 🔗 Related Files

- **API Service:** `src/services/api.ts` ✅
- **Types:** `src/types/index.ts` (may need extension)
- **Booking Store:** `src/store/bookingStore.ts` (may need updates)
- **Routes:** `src/App.tsx` (add new routes)

---

**Status:** Backend APIs fully implemented and tested ✅
**Frontend:** PromoCode component completed, API service extended ✅
**Next Steps:** Implement remaining UI components following this guide
