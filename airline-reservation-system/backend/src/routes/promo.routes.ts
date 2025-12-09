import express from 'express';
import { validatePromoCode, getActivePromoCodes, recordPromoCodeUsage } from '../controllers/promo.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   POST /api/promo/validate
 * @desc    Validate a promo code
 * @access  Public
 */
router.post('/validate', optionalAuth, validatePromoCode);

/**
 * @route   GET /api/promo/active
 * @desc    Get all active promo codes
 * @access  Public
 */
router.get('/active', getActivePromoCodes);

/**
 * @route   POST /api/promo/record-usage
 * @desc    Record promo code usage (internal use during booking)
 * @access  Private
 */
router.post('/record-usage', optionalAuth, recordPromoCodeUsage);

export default router;
