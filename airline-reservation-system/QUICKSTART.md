# Quick Start Guide

This guide will help you get the Airline Reservation System up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL v14+ installed and running
- [ ] npm or yarn installed
- [ ] Git installed

## Setup Steps (5 minutes)

### Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb airline_reservation

# Or using psql:
psql -U postgres -c "CREATE DATABASE airline_reservation;"

# Run schema
cd airline-reservation-system/backend
psql -U postgres -d airline_reservation -f src/database/schema.sql
```

### Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env - IMPORTANT: Update these values!
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_random_secret_key_here

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

✅ Backend should be running on http://localhost:5000

### Step 3: Frontend Setup (1 minute)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Setup environment (optional)
cp .env.example .env

# Start frontend
npm run dev
```

✅ Frontend should be running on http://localhost:3000

## Verify Installation

### 1. Check Backend Health
Open browser: http://localhost:5000/health

Expected response:
```json
{
  "success": true,
  "message": "Airline Reservation API is running"
}
```

### 2. Test Frontend
Open browser: http://localhost:3000

You should see the home page with flight search form.

### 3. Test Complete Flow

1. **Search Flights:**
   - From: JFK (New York)
   - To: LAX (Los Angeles)
   - Date: Tomorrow
   - Click "Search Flights"

2. **Register Account:**
   - Click "Sign Up"
   - Fill in details
   - Register

3. **Make Booking:**
   - Select a flight
   - Fill passenger info
   - Complete booking

4. **View Bookings:**
   - Go to "My Bookings"
   - See your booking with PNR code

## Sample Test Data

After seeding, you can search for these routes:

| Route | Airline | Price |
|-------|---------|-------|
| JFK → LAX | American Airlines | $299 |
| JFK → LHR | British Airways | $599 |
| SFO → NRT | Japan Airlines | $899 |
| ORD → MIA | American Airlines | $199 |
| BOS → LAX | United Airlines | $319 |

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check if port 5000 is free
lsof -i :5000
```

### Frontend won't start
```bash
# Check if port 3000 is free
lsof -i :3000

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
- Verify PostgreSQL is running
- Check DB credentials in backend/.env
- Ensure database exists: `psql -l | grep airline_reservation`

### Seed script fails
```bash
# Drop and recreate database
dropdb airline_reservation
createdb airline_reservation
psql -d airline_reservation -f src/database/schema.sql
npm run seed
```

## What's Next?

Once everything is running:

1. ✅ Review the code structure
2. ✅ Test all features
3. ✅ Check API endpoints with Postman/Insomnia
4. ✅ Review the PRD for future enhancements
5. ✅ Deploy to production (see DEPLOYMENT.md)

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in the README
- Check database schema in backend/src/database/schema.sql

---

**Total Setup Time:** ~5 minutes
**Recommended for Review:** ✅ Ready
