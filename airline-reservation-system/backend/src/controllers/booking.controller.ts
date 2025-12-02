import { Request, Response } from 'express';
import { query } from '../config/database';
import { CreateBookingRequest } from '../types';
import emailService from '../services/email.service';
import smsService from '../services/sms.service';

// Helper function to generate PNR
const generatePNR = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  const client = await (await import('../config/database')).default.connect();

  try {
    await client.query('BEGIN');

    const {
      flights,
      passengers,
      contact_email,
      contact_phone,
      ancillaries,
      payment_method,
      special_requests
    }: CreateBookingRequest = req.body;

    // Validation
    if (!flights || flights.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'At least one flight is required'
      });
    }

    if (!passengers || passengers.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'At least one passenger is required'
      });
    }

    // Get flight details and calculate total price
    let totalPrice = 0;
    const flightDetails: any[] = [];

    for (const flightId of flights) {
      const flightResult = await client.query(
        `SELECT id, flight_number, base_price_economy, base_price_business, base_price_first,
                available_seats_economy, available_seats_business, available_seats_first
         FROM flights WHERE id = $1`,
        [flightId]
      );

      if (flightResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Flight ${flightId} not found`
        });
      }

      flightDetails.push(flightResult.rows[0]);
    }

    // Calculate price (assuming economy for now, can be extended)
    passengers.forEach(() => {
      flightDetails.forEach(flight => {
        totalPrice += Number(flight.base_price_economy);
      });
    });

    // Add ancillary prices
    if (ancillaries && ancillaries.length > 0) {
      ancillaries.forEach(ancillary => {
        totalPrice += Number(ancillary.price) * ancillary.quantity;
      });
    }

    // Generate PNR
    const pnr = generatePNR();

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (pnr, user_id, total_price, contact_email, contact_phone,
                             payment_method, special_requests, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending')
       RETURNING *`,
      [
        pnr,
        req.user?.userId || null,
        totalPrice,
        contact_email,
        contact_phone,
        payment_method,
        special_requests
      ]
    );

    const booking = bookingResult.rows[0];

    // Link flights to booking
    for (const flightId of flights) {
      await client.query(
        'INSERT INTO booking_flights (booking_id, flight_id) VALUES ($1, $2)',
        [booking.id, flightId]
      );
    }

    // Add passengers
    for (const passenger of passengers) {
      for (const flightId of flights) {
        await client.query(
          `INSERT INTO passengers (booking_id, flight_id, type, title, first_name, last_name,
                                  date_of_birth, gender, nationality, passport_number,
                                  passport_expiry, seat_number, frequent_flyer_number,
                                  special_assistance, meal_preference, baggage_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            booking.id,
            flightId,
            passenger.type,
            passenger.title,
            passenger.first_name,
            passenger.last_name,
            passenger.date_of_birth,
            passenger.gender,
            passenger.nationality,
            passenger.passport_number,
            passenger.passport_expiry,
            passenger.seat_number,
            passenger.frequent_flyer_number,
            passenger.special_assistance,
            passenger.meal_preference,
            passenger.baggage_count || 0
          ]
        );
      }
    }

    // Add ancillary services
    if (ancillaries && ancillaries.length > 0) {
      for (const ancillary of ancillaries) {
        await client.query(
          `INSERT INTO ancillary_services (booking_id, service_type, description, quantity, price)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            booking.id,
            ancillary.service_type,
            ancillary.description,
            ancillary.quantity,
            ancillary.price
          ]
        );
      }
    }

    // Update seat availability
    for (const flightId of flights) {
      await client.query(
        `UPDATE flights
         SET available_seats_economy = available_seats_economy - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [passengers.length, flightId]
      );
    }

    await client.query('COMMIT');

    // Send email and SMS notifications (async, don't block response)
    try {
      // Get full flight details for notifications
      const flightsForNotification = await client.query(
        `SELECT f.flight_number, a.name as airline_name,
                f.departure_airport, f.arrival_airport,
                f.departure_time, f.arrival_time,
                dep.city as dep_city, arr.city as arr_city
         FROM flights f
         JOIN airlines a ON f.airline_code = a.code
         JOIN airports dep ON f.departure_airport = dep.code
         JOIN airports arr ON f.arrival_airport = arr.code
         WHERE f.id = ANY($1)`,
        [flights]
      );

      const passengerName = `${passengers[0].title} ${passengers[0].first_name} ${passengers[0].last_name}`;

      const baseNotificationData = {
        pnr: booking.pnr,
        total_price: Number(totalPrice),
        passenger_name: passengerName,
        flights: flightsForNotification.rows
      };

      // Send email (don't await - fire and forget)
      emailService.sendBookingConfirmation({
        ...baseNotificationData,
        contact_email: contact_email
      }).catch(err => {
        console.error('Email notification failed:', err);
      });

      // Send SMS (don't await - fire and forget)
      if (contact_phone) {
        smsService.sendBookingConfirmation({
          ...baseNotificationData,
          contact_phone: contact_phone
        }).catch(err => {
          console.error('SMS notification failed:', err);
        });
      }
    } catch (notificationError: any) {
      // Log but don't fail the booking
      console.error('Notification error:', notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking_id: booking.id,
        pnr: booking.pnr,
        total_price: booking.total_price,
        status: booking.status,
        payment_status: booking.payment_status
      }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  } finally {
    client.release();
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Get booking details
    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 OR pnr = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Check authorization
    if (req.user && booking.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this booking'
      });
    }

    // Get flights
    const flightsResult = await query(
      `SELECT f.*, a.name as airline_name, a.logo_url as airline_logo,
              dep.name as dep_airport_name, dep.city as dep_city,
              arr.name as arr_airport_name, arr.city as arr_city
       FROM booking_flights bf
       JOIN flights f ON bf.flight_id = f.id
       JOIN airlines a ON f.airline_code = a.code
       JOIN airports dep ON f.departure_airport = dep.code
       JOIN airports arr ON f.arrival_airport = arr.code
       WHERE bf.booking_id = $1`,
      [booking.id]
    );

    // Get passengers
    const passengersResult = await query(
      'SELECT * FROM passengers WHERE booking_id = $1',
      [booking.id]
    );

    // Get ancillary services
    const ancillariesResult = await query(
      'SELECT * FROM ancillary_services WHERE booking_id = $1',
      [booking.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        flights: flightsResult.rows,
        passengers: passengersResult.rows,
        ancillaries: ancillariesResult.rows
      }
    });
  } catch (error: any) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get booking',
      error: error.message
    });
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { status } = req.query;

    let queryText = `
      SELECT b.*, COUNT(DISTINCT bf.flight_id) as flight_count
      FROM bookings b
      LEFT JOIN booking_flights bf ON b.id = bf.booking_id
      WHERE b.user_id = $1
    `;

    const params: any[] = [req.user.userId];

    if (status) {
      queryText += ' AND b.status = $2';
      params.push(status);
    }

    queryText += ' GROUP BY b.id ORDER BY b.booking_date DESC';

    const result = await query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<Response> => {
  const client = await (await import('../config/database')).default.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 OR pnr = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    // Check authorization
    if (req.user && booking.user_id !== req.user.userId && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    await client.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', booking.id]
    );

    // Restore seat availability
    const flightsResult = await client.query(
      'SELECT flight_id FROM booking_flights WHERE booking_id = $1',
      [booking.id]
    );

    const passengersResult = await client.query(
      'SELECT COUNT(*) as count FROM passengers WHERE booking_id = $1',
      [booking.id]
    );

    const passengerCount = parseInt(passengersResult.rows[0].count);

    for (const flight of flightsResult.rows) {
      await client.query(
        `UPDATE flights
         SET available_seats_economy = available_seats_economy + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [passengerCount, flight.flight_id]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  } finally {
    client.release();
  }
};
