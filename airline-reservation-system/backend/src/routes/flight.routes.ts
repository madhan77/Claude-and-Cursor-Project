import { Router } from 'express';
import {
  searchFlights,
  getFlightById,
  getFlightSeats,
  getAirports,
  getAirlines
} from '../controllers/flight.controller';

const router = Router();

// Public routes
router.get('/search', searchFlights);
router.get('/airports', getAirports);
router.get('/airlines', getAirlines);
router.get('/:id', getFlightById);
router.get('/:id/seats', getFlightSeats);

export default router;
