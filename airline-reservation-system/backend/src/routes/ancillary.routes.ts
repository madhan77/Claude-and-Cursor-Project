import express from 'express';
import {
  getBaggageOptions,
  addBaggageToBooking,
  getMealOptions,
  addMealToBooking,
  getInsuranceProducts,
  addInsuranceToBooking,
  getBookingAncillaries
} from '../controllers/ancillary.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Baggage routes
router.get('/baggage/options', getBaggageOptions);
router.post('/baggage/add', optionalAuth, addBaggageToBooking);

// Meal routes
router.get('/meals/options', getMealOptions);
router.post('/meals/add', optionalAuth, addMealToBooking);

// Insurance routes
router.get('/insurance/products', getInsuranceProducts);
router.post('/insurance/add', optionalAuth, addInsuranceToBooking);

// Get all ancillaries for a booking
router.get('/booking/:bookingId', optionalAuth, getBookingAncillaries);

export default router;
