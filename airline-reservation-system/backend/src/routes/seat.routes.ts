import express from 'express';
import {
  getFlightSeatMap,
  selectSeat,
  getBookingSeatSelections,
  initializeAircraftSeats
} from '../controllers/seat.controller';
import { optionalAuth, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Get seat map for a flight
router.get('/flight/:flightId', getFlightSeatMap);

// Select a seat
router.post('/select', optionalAuth, selectSeat);

// Get seat selections for a booking
router.get('/booking/:bookingId', optionalAuth, getBookingSeatSelections);

// Initialize aircraft seats (admin only)
router.post('/initialize-aircraft', optionalAuth, authorize('admin'), initializeAircraftSeats);

export default router;
