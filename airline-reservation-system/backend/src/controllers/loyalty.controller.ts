import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Get loyalty programs
 * GET /api/loyalty/programs
 */
export const getLoyaltyPrograms = async (_req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT lp.*, a.name as airline_name
      FROM loyalty_programs lp
      JOIN airlines a ON lp.airline_code = a.code
      WHERE lp.is_active = true
      ORDER BY lp.airline_code
    `;

    const result = await client.query(query);

    res.json({
      success: true,
      programs: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching loyalty programs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty programs',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get user's loyalty memberships
 * GET /api/loyalty/my-memberships
 */
export const getMyMemberships = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const query = `
      SELECT lm.*, lp.program_name, lp.airline_code,
             lt.tier_name, lt.benefits,
             a.name as airline_name
      FROM loyalty_members lm
      JOIN loyalty_programs lp ON lm.program_id = lp.id
      JOIN loyalty_tiers lt ON lm.tier_id = lt.id
      JOIN airlines a ON lp.airline_code = a.code
      WHERE lm.user_id = $1 AND lm.is_active = true
      ORDER BY lm.points_balance DESC
    `;

    const result = await client.query(query, [req.user.userId]);

    res.json({
      success: true,
      memberships: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch memberships',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Enroll in loyalty program
 * POST /api/loyalty/enroll
 */
export const enrollInProgram = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { programId } = req.body;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required'
      });
    }

    await client.query('BEGIN');

    // Check if already enrolled
    const existingQuery = `
      SELECT * FROM loyalty_members
      WHERE user_id = $1 AND program_id = $2
    `;
    const existingResult = await client.query(existingQuery, [req.user.userId, programId]);

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this program'
      });
    }

    // Get program and base tier
    const programQuery = `
      SELECT lp.*, lt.id as tier_id
      FROM loyalty_programs lp
      JOIN loyalty_tiers lt ON lp.id = lt.program_id
      WHERE lp.id = $1 AND lp.is_active = true AND lt.tier_level = 1
      LIMIT 1
    `;
    const programResult = await client.query(programQuery, [programId]);

    if (programResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    const program = programResult.rows[0];

    // Generate membership number
    const membershipNumber = `${program.program_code}${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Enroll user
    const insertQuery = `
      INSERT INTO loyalty_members (
        user_id, program_id, tier_id, membership_number,
        points_balance, lifetime_points, tier_points
      )
      VALUES ($1, $2, $3, $4, 0, 0, 0)
      RETURNING id, membership_number
    `;

    const result = await client.query(insertQuery, [
      req.user.userId,
      programId,
      program.tier_id,
      membershipNumber
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Successfully enrolled in loyalty program',
      membership: {
        id: result.rows[0].id,
        membership_number: result.rows[0].membership_number,
        program: program.program_name
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error enrolling in program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in program',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get loyalty transactions
 * GET /api/loyalty/transactions/:membershipId
 */
export const getLoyaltyTransactions = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { membershipId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT * FROM loyalty_transactions
      WHERE member_id = $1
      ORDER BY transaction_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await client.query(query, [membershipId, limit, offset]);

    res.json({
      success: true,
      transactions: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  } finally {
    client.release();
  }
};
