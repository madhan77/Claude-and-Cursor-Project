import express from 'express';
import {
  performOnlineCheckin,
  getBoardingPass,
  getCheckinStatus
} from '../controllers/checkin.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Perform online check-in
router.post('/online', optionalAuth, performOnlineCheckin);

// Get boarding pass
router.get('/boarding-pass/:passengerId/:flightId', optionalAuth, getBoardingPass);

// Get check-in status for booking
router.get('/status/:bookingId', optionalAuth, getCheckinStatus);

export default router;
