import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Perform online check-in
 * POST /api/checkin/online
 */
export const performOnlineCheckin = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId, passengerId, flightId } = req.body;

    if (!bookingId || !passengerId || !flightId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, passenger ID, and flight ID are required'
      });
    }

    await client.query('BEGIN');

    // Verify booking and passenger exist
    const passengerQuery = `
      SELECT p.*, b.status as booking_status, f.departure_time, f.gate, f.terminal
      FROM passengers p
      JOIN bookings b ON p.booking_id = b.id
      JOIN flights f ON p.flight_id = f.id
      WHERE p.id = $1 AND p.booking_id = $2 AND p.flight_id = $3
    `;
    const passengerResult = await client.query(passengerQuery, [passengerId, bookingId, flightId]);

    if (passengerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Passenger not found or does not match booking/flight'
      });
    }

    const passenger = passengerResult.rows[0];

    if (passenger.booking_status !== 'confirmed') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed before check-in'
      });
    }

    // Check if already checked in
    const existingCheckinQuery = `
      SELECT * FROM check_in_records
      WHERE passenger_id = $1 AND flight_id = $2
    `;
    const existingResult = await client.query(existingCheckinQuery, [passengerId, flightId]);

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Passenger already checked in'
      });
    }

    // Check if within check-in window (24 hours before departure)
    const departureTime = new Date(passenger.departure_time);
    const now = new Date();
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeparture > 24) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Check-in opens 24 hours before departure'
      });
    }

    if (hoursUntilDeparture < 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Check-in has closed for this flight'
      });
    }

    // Assign boarding group based on class and check-in time
    let boardingGroup = 'C';
    if (passenger.seat_number) {
      const seatClass = await client.query(
        'SELECT seat_class FROM seat_selections WHERE passenger_id = $1 AND flight_id = $2',
        [passengerId, flightId]
      );
      if (seatClass.rows.length > 0) {
        const seatClassValue = seatClass.rows[0].seat_class;
        boardingGroup = seatClassValue === 'first' ? 'A' : seatClassValue === 'business' ? 'B' : 'C';
      }
    }

    // Calculate boarding time (1.5 hours before departure for international, 45 min for domestic)
    const boardingTime = new Date(departureTime);
    boardingTime.setMinutes(boardingTime.getMinutes() - 90);

    // Create check-in record
    const checkinInsertQuery = `
      INSERT INTO check_in_records (
        booking_id, passenger_id, flight_id, check_in_method,
        seat_number, boarding_group, boarding_time, gate, terminal, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'checked_in')
      RETURNING id
    `;

    const checkinResult = await client.query(checkinInsertQuery, [
      bookingId,
      passengerId,
      flightId,
      'online',
      passenger.seat_number,
      boardingGroup,
      boardingTime,
      passenger.gate,
      passenger.terminal
    ]);

    const checkinId = checkinResult.rows[0].id;

    // Generate boarding pass
    const barcode = `BP${Date.now()}${passengerId.substring(0, 8)}`;
    const boardingPassNumber = `${passenger.seat_number || 'XX'}${boardingGroup}${Date.now().toString().slice(-6)}`;

    const boardingPassInsertQuery = `
      INSERT INTO boarding_passes (
        check_in_record_id, passenger_id, flight_id, barcode,
        boarding_pass_number, seat_number, boarding_group, boarding_time, gate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, boarding_pass_number
    `;

    const boardingPassResult = await client.query(boardingPassInsertQuery, [
      checkinId,
      passengerId,
      flightId,
      barcode,
      boardingPassNumber,
      passenger.seat_number,
      boardingGroup,
      boardingTime,
      passenger.gate
    ]);

    // Update passenger record
    await client.query(
      'UPDATE passengers SET checked_in = true, boarding_pass_issued = true WHERE id = $1',
      [passengerId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Check-in successful',
      checkin: {
        id: checkinId,
        boarding_group: boardingGroup,
        boarding_time: boardingTime,
        seat_number: passenger.seat_number,
        gate: passenger.gate,
        terminal: passenger.terminal
      },
      boardingPass: {
        id: boardingPassResult.rows[0].id,
        boarding_pass_number: boardingPassResult.rows[0].boarding_pass_number,
        barcode
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error during check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete check-in',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get boarding pass
 * GET /api/checkin/boarding-pass/:passengerId/:flightId
 */
export const getBoardingPass = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { passengerId, flightId } = req.params;

    const query = `
      SELECT bp.*, cr.boarding_group, cr.boarding_time, cr.gate, cr.terminal,
             p.first_name, p.last_name, p.type as passenger_type,
             f.flight_number, f.departure_airport, f.arrival_airport,
             f.departure_time, f.arrival_time,
             b.pnr
      FROM boarding_passes bp
      JOIN check_in_records cr ON bp.check_in_record_id = cr.id
      JOIN passengers p ON bp.passenger_id = p.id
      JOIN flights f ON bp.flight_id = f.id
      JOIN bookings b ON p.booking_id = b.id
      WHERE bp.passenger_id = $1 AND bp.flight_id = $2
      AND bp.is_valid = true
    `;

    const result = await client.query(query, [passengerId, flightId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Boarding pass not found'
      });
    }

    res.json({
      success: true,
      boardingPass: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error fetching boarding pass:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch boarding pass',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get check-in status for booking
 * GET /api/checkin/status/:bookingId
 */
export const getCheckinStatus = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId } = req.params;

    const query = `
      SELECT p.id as passenger_id, p.first_name, p.last_name,
             p.checked_in, p.boarding_pass_issued,
             f.flight_number, f.departure_time,
             cr.boarding_group, cr.gate, cr.terminal
      FROM passengers p
      JOIN flights f ON p.flight_id = f.id
      LEFT JOIN check_in_records cr ON p.id = cr.passenger_id AND f.id = cr.flight_id
      WHERE p.booking_id = $1
      ORDER BY f.departure_time, p.first_name
    `;

    const result = await client.query(query, [bookingId]);

    res.json({
      success: true,
      passengers: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching check-in status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-in status',
      error: error.message
    });
  } finally {
    client.release();
  }
};
