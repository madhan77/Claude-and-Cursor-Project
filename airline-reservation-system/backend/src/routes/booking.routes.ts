import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  getUserBookings,
  cancelBooking
} from '../controllers/booking.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Routes
router.post('/', optionalAuth, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/:id', optionalAuth, getBookingById);
router.delete('/:id', optionalAuth, cancelBooking);

export default router;
