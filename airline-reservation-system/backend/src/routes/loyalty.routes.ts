import express from 'express';
import {
  getLoyaltyPrograms,
  getMyMemberships,
  enrollInProgram,
  getLoyaltyTransactions
} from '../controllers/loyalty.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Get all loyalty programs
router.get('/programs', getLoyaltyPrograms);

// Get user's memberships (requires auth)
router.get('/my-memberships', authenticate, getMyMemberships);

// Enroll in a program (requires auth)
router.post('/enroll', authenticate, enrollInProgram);

// Get loyalty transactions
router.get('/transactions/:membershipId', optionalAuth, getLoyaltyTransactions);

export default router;
