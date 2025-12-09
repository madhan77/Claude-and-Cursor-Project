import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Get available baggage options
 * GET /api/ancillary/baggage/options
 */
export const getBaggageOptions = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { airlineCode } = req.query;

    let query = `
      SELECT bo.*, a.name as airline_name
      FROM baggage_options bo
      JOIN airlines a ON bo.airline_code = a.code
      WHERE bo.is_active = true
    `;
    const params: any[] = [];

    if (airlineCode) {
      query += ' AND bo.airline_code = $1';
      params.push(airlineCode);
    }

    query += ' ORDER BY bo.airline_code, bo.price';

    const result = await client.query(query, params);

    res.json({
      success: true,
      baggageOptions: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching baggage options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch baggage options',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Add baggage to booking
 * POST /api/ancillary/baggage/add
 */
export const addBaggageToBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId, passengerId, baggageOptionId, quantity, specialNotes } = req.body;

    if (!bookingId || !passengerId || !baggageOptionId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, passenger ID, and baggage option ID are required'
      });
    }

    // Get baggage option price
    const baggageQuery = 'SELECT price FROM baggage_options WHERE id = $1 AND is_active = true';
    const baggageResult = await client.query(baggageQuery, [baggageOptionId]);

    if (baggageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Baggage option not found'
      });
    }

    const price = parseFloat(baggageResult.rows[0].price);
    const qty = quantity || 1;
    const totalPrice = price * qty;

    // Insert baggage selection
    const insertQuery = `
      INSERT INTO booking_baggage (booking_id, passenger_id, baggage_option_id, quantity, total_price, special_notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      bookingId,
      passengerId,
      baggageOptionId,
      qty,
      totalPrice,
      specialNotes
    ]);

    res.json({
      success: true,
      message: 'Baggage added successfully',
      baggageId: result.rows[0].id,
      totalPrice
    });

  } catch (error: any) {
    console.error('Error adding baggage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add baggage',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get available meal options
 * GET /api/ancillary/meals/options
 */
export const getMealOptions = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { airlineCode, dietaryType } = req.query;

    let query = `
      SELECT mo.*, a.name as airline_name
      FROM meal_options mo
      JOIN airlines a ON mo.airline_code = a.code
      WHERE mo.is_active = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (airlineCode) {
      query += ` AND mo.airline_code = $${paramIndex}`;
      params.push(airlineCode);
      paramIndex++;
    }

    if (dietaryType) {
      query += ` AND mo.dietary_type = $${paramIndex}`;
      params.push(dietaryType);
      paramIndex++;
    }

    query += ' ORDER BY mo.airline_code, mo.price, mo.meal_name';

    const result = await client.query(query, params);

    res.json({
      success: true,
      mealOptions: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching meal options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal options',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Add meal to booking
 * POST /api/ancillary/meals/add
 */
export const addMealToBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId, passengerId, flightId, mealOptionId, quantity, specialRequests } = req.body;

    if (!bookingId || !passengerId || !flightId || !mealOptionId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, passenger ID, flight ID, and meal option ID are required'
      });
    }

    // Get meal option price
    const mealQuery = 'SELECT price FROM meal_options WHERE id = $1 AND is_active = true';
    const mealResult = await client.query(mealQuery, [mealOptionId]);

    if (mealResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Meal option not found'
      });
    }

    const price = parseFloat(mealResult.rows[0].price);
    const qty = quantity || 1;
    const totalPrice = price * qty;

    // Insert meal selection
    const insertQuery = `
      INSERT INTO booking_meals (booking_id, passenger_id, flight_id, meal_option_id, quantity, total_price, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      bookingId,
      passengerId,
      flightId,
      mealOptionId,
      qty,
      totalPrice,
      specialRequests
    ]);

    res.json({
      success: true,
      message: 'Meal added successfully',
      mealId: result.rows[0].id,
      totalPrice
    });

  } catch (error: any) {
    console.error('Error adding meal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add meal',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get insurance products
 * GET /api/ancillary/insurance/products
 */
export const getInsuranceProducts = async (_req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT * FROM insurance_products
      WHERE is_active = true
      ORDER BY price
    `;

    const result = await client.query(query);

    res.json({
      success: true,
      insuranceProducts: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching insurance products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance products',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Add insurance to booking
 * POST /api/ancillary/insurance/add
 */
export const addInsuranceToBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId, passengerId, insuranceProductId, coverageStartDate, coverageEndDate } = req.body;

    if (!bookingId || !insuranceProductId || !coverageStartDate || !coverageEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, insurance product ID, and coverage dates are required'
      });
    }

    // Get insurance product details
    const productQuery = 'SELECT * FROM insurance_products WHERE id = $1 AND is_active = true';
    const productResult = await client.query(productQuery, [insuranceProductId]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Insurance product not found'
      });
    }

    const product = productResult.rows[0];
    const premiumAmount = parseFloat(product.price);

    // Generate policy number
    const policyNumber = `POL${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert insurance purchase
    const insertQuery = `
      INSERT INTO booking_insurance (
        booking_id, passenger_id, insurance_product_id, policy_number,
        coverage_start_date, coverage_end_date, premium_amount, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING id, policy_number
    `;

    const result = await client.query(insertQuery, [
      bookingId,
      passengerId,
      insuranceProductId,
      policyNumber,
      coverageStartDate,
      coverageEndDate,
      premiumAmount
    ]);

    res.json({
      success: true,
      message: 'Insurance added successfully',
      insuranceId: result.rows[0].id,
      policyNumber: result.rows[0].policy_number,
      premiumAmount
    });

  } catch (error: any) {
    console.error('Error adding insurance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add insurance',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get booking ancillary services
 * GET /api/ancillary/booking/:bookingId
 */
export const getBookingAncillaries = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId } = req.params;

    // Get baggage
    const baggageQuery = `
      SELECT bb.*, bo.baggage_type, bo.description,
             p.first_name, p.last_name
      FROM booking_baggage bb
      JOIN baggage_options bo ON bb.baggage_option_id = bo.id
      JOIN passengers p ON bb.passenger_id = p.id
      WHERE bb.booking_id = $1
    `;
    const baggageResult = await client.query(baggageQuery, [bookingId]);

    // Get meals
    const mealsQuery = `
      SELECT bm.*, mo.meal_name, mo.dietary_type,
             p.first_name, p.last_name
      FROM booking_meals bm
      JOIN meal_options mo ON bm.meal_option_id = mo.id
      JOIN passengers p ON bm.passenger_id = p.id
      WHERE bm.booking_id = $1
    `;
    const mealsResult = await client.query(mealsQuery, [bookingId]);

    // Get insurance
    const insuranceQuery = `
      SELECT bi.*, ip.product_name, ip.coverage_amount,
             p.first_name, p.last_name
      FROM booking_insurance bi
      JOIN insurance_products ip ON bi.insurance_product_id = ip.id
      LEFT JOIN passengers p ON bi.passenger_id = p.id
      WHERE bi.booking_id = $1
    `;
    const insuranceResult = await client.query(insuranceQuery, [bookingId]);

    res.json({
      success: true,
      ancillaries: {
        baggage: baggageResult.rows,
        meals: mealsResult.rows,
        insurance: insuranceResult.rows
      }
    });

  } catch (error: any) {
    console.error('Error fetching booking ancillaries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking ancillaries',
      error: error.message
    });
  } finally {
    client.release();
  }
};
