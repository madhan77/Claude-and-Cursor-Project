import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Validate a promo code
 * POST /api/promo/validate
 */
export const validatePromoCode = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { code, bookingAmount, routeCode, classType, airlineCode } = req.body;

    if (!code || !bookingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Promo code and booking amount are required'
      });
    }

    // Get promo code details
    const promoQuery = `
      SELECT * FROM promo_codes
      WHERE code = $1
      AND is_active = true
      AND valid_from <= CURRENT_TIMESTAMP
      AND valid_until >= CURRENT_TIMESTAMP
    `;

    const promoResult = await client.query(promoQuery, [code.toUpperCase()]);

    if (promoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    const promo = promoResult.rows[0];

    // Check minimum purchase amount
    if (bookingAmount < parseFloat(promo.min_purchase_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of $${promo.min_purchase_amount} required`
      });
    }

    // Check usage limit
    if (promo.usage_limit) {
      const usageQuery = 'SELECT COUNT(*) FROM promo_code_usage WHERE promo_code_id = $1';
      const usageResult = await client.query(usageQuery, [promo.id]);
      const usageCount = parseInt(usageResult.rows[0].count);

      if (usageCount >= promo.usage_limit) {
        return res.status(400).json({
          success: false,
          message: 'Promo code usage limit reached'
        });
      }
    }

    // Check usage per user (if user is logged in)
    if (req.user && promo.usage_per_user) {
      const userUsageQuery = `
        SELECT COUNT(*) FROM promo_code_usage
        WHERE promo_code_id = $1 AND user_id = $2
      `;
      const userUsageResult = await client.query(userUsageQuery, [promo.id, req.user.userId]);
      const userUsageCount = parseInt(userUsageResult.rows[0].count);

      if (userUsageCount >= promo.usage_per_user) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this promo code'
        });
      }
    }

    // Check applicable routes
    if (promo.applicable_routes && promo.applicable_routes.length > 0) {
      if (!routeCode || !promo.applicable_routes.includes(routeCode)) {
        return res.status(400).json({
          success: false,
          message: 'Promo code not applicable to this route'
        });
      }
    }

    // Check applicable classes
    if (promo.applicable_classes && promo.applicable_classes.length > 0) {
      if (!classType || !promo.applicable_classes.includes(classType)) {
        return res.status(400).json({
          success: false,
          message: 'Promo code not applicable to this class'
        });
      }
    }

    // Check applicable airline
    if (promo.airline_code && airlineCode && promo.airline_code !== airlineCode) {
      return res.status(400).json({
        success: false,
        message: `Promo code only applicable to ${promo.airline_code} flights`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = (bookingAmount * parseFloat(promo.discount_value)) / 100;

      // Apply max discount cap if exists
      if (promo.max_discount_amount && discountAmount > parseFloat(promo.max_discount_amount)) {
        discountAmount = parseFloat(promo.max_discount_amount);
      }
    } else if (promo.discount_type === 'fixed_amount') {
      discountAmount = parseFloat(promo.discount_value);
    }

    // Ensure discount doesn't exceed booking amount
    if (discountAmount > bookingAmount) {
      discountAmount = bookingAmount;
    }

    const finalAmount = bookingAmount - discountAmount;

    res.json({
      success: true,
      message: 'Promo code is valid',
      promoCode: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: promo.discount_value
      },
      calculation: {
        originalAmount: bookingAmount,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2)
      }
    });

  } catch (error: any) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get all active promo codes (public)
 * GET /api/promo/active
 */
export const getActivePromoCodes = async (_req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT code, description, discount_type, discount_value,
             min_purchase_amount, max_discount_amount,
             valid_from, valid_until
      FROM promo_codes
      WHERE is_active = true
      AND valid_from <= CURRENT_TIMESTAMP
      AND valid_until >= CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `;

    const result = await client.query(query);

    res.json({
      success: true,
      promoCodes: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching active promo codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo codes',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Record promo code usage
 * POST /api/promo/record-usage
 */
export const recordPromoCodeUsage = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { promoCodeId, bookingId, discountAmount } = req.body;

    if (!promoCodeId || !bookingId || discountAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Promo code ID, booking ID, and discount amount are required'
      });
    }

    const userId = req.user?.userId || null;

    const query = `
      INSERT INTO promo_code_usage (promo_code_id, booking_id, user_id, discount_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    await client.query(query, [promoCodeId, bookingId, userId, discountAmount]);

    res.json({
      success: true,
      message: 'Promo code usage recorded'
    });

  } catch (error: any) {
    console.error('Error recording promo code usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record promo code usage',
      error: error.message
    });
  } finally {
    client.release();
  }
};
