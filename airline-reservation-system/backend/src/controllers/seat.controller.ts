import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Helper function to generate seat map for an aircraft
 */
async function generateSeatMapForAircraft(client: any, aircraftId: string, aircraft: any) {
  // Get aircraft details if not provided
  let aircraftData = aircraft;
  if (!aircraft.first_class_seats && !aircraft.business_seats && !aircraft.economy_seats) {
    const aircraftQuery = 'SELECT * FROM aircraft WHERE id = $1';
    const aircraftResult = await client.query(aircraftQuery, [aircraftId]);
    if (aircraftResult.rows.length > 0) {
      aircraftData = aircraftResult.rows[0];
    }
  }

  // Create seat map based on aircraft configuration
  // Standard layout: A-F columns (A, B, C = left; D, E, F = right)
  const seats = [];
  let currentRow = 1;

  // First class (rows 1-2, 4 seats per row: A, C, D, F)
  if (aircraftData.first_class_seats > 0) {
    const firstClassRows = Math.ceil(aircraftData.first_class_seats / 4);
    for (let row = currentRow; row < currentRow + firstClassRows; row++) {
      for (const col of ['A', 'C', 'D', 'F']) {
        seats.push({
          seat_number: `${row}${col}`,
          row_number: row,
          column_letter: col,
          class: 'first',
          type: col === 'A' || col === 'F' ? 'window' : 'aisle',
          extra_price: 0
        });
      }
    }
    currentRow += firstClassRows;
  }

  // Business class (4 seats per row: A, C, D, F)
  if (aircraftData.business_seats > 0) {
    const businessClassRows = Math.ceil(aircraftData.business_seats / 4);
    for (let row = currentRow; row < currentRow + businessClassRows; row++) {
      for (const col of ['A', 'C', 'D', 'F']) {
        seats.push({
          seat_number: `${row}${col}`,
          row_number: row,
          column_letter: col,
          class: 'business',
          type: col === 'A' || col === 'F' ? 'window' : 'aisle',
          extra_price: 0
        });
      }
    }
    currentRow += businessClassRows;
  }

  // Economy class (6 seats per row: A, B, C, D, E, F)
  if (aircraftData.economy_seats > 0) {
    const economyClassRows = Math.ceil(aircraftData.economy_seats / 6);
    for (let row = currentRow; row < currentRow + economyClassRows; row++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        const type = col === 'A' || col === 'F' ? 'window' :
                    col === 'C' || col === 'D' ? 'aisle' : 'middle';

        // Exit rows get extra legroom (every 10th row in economy)
        const isExitRow = row % 10 === 0;

        seats.push({
          seat_number: `${row}${col}`,
          row_number: row,
          column_letter: col,
          class: 'economy',
          type: isExitRow ? 'exit_row' : type,
          extra_price: isExitRow ? 25 : (type === 'aisle' || type === 'window') && row > currentRow + 3 ? 10 : 0
        });
      }
    }
  }

  // Insert all seats
  for (const seat of seats) {
    await client.query(
      `INSERT INTO seat_maps (aircraft_id, seat_number, row_number, column_letter, class, type, extra_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [aircraftId, seat.seat_number, seat.row_number, seat.column_letter, seat.class, seat.type, seat.extra_price]
    );
  }

  console.log(`✅ Generated ${seats.length} seats for aircraft ${aircraftId}`);
  return seats.length;
}

/**
 * Get seat map for a flight
 * GET /api/seats/flight/:flightId
 */
export const getFlightSeatMap = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { flightId } = req.params;

    // Get flight and aircraft info
    const flightQuery = `
      SELECT f.*, a.model, a.total_seats
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      WHERE f.id = $1
    `;
    const flightResult = await client.query(flightQuery, [flightId]);

    if (flightResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    const flight = flightResult.rows[0];

    // Get seat map for this aircraft
    const seatMapQuery = `
      SELECT * FROM seat_maps
      WHERE aircraft_id = $1
      ORDER BY row_number, column_letter
    `;
    let seatMapResult = await client.query(seatMapQuery, [flight.aircraft_id]);

    // If no seat map exists, auto-generate it
    if (seatMapResult.rows.length === 0) {
      console.log(`No seat map found for aircraft ${flight.aircraft_id}, auto-generating...`);
      await generateSeatMapForAircraft(client, flight.aircraft_id, flight);
      seatMapResult = await client.query(seatMapQuery, [flight.aircraft_id]);
    }

    // Get already selected seats for this flight
    const selectedSeatsQuery = `
      SELECT seat_number, passenger_id
      FROM seat_selections
      WHERE flight_id = $1
    `;
    const selectedSeatsResult = await client.query(selectedSeatsQuery, [flightId]);

    const selectedSeats = selectedSeatsResult.rows.reduce((acc: any, row: any) => {
      acc[row.seat_number] = row.passenger_id;
      return acc;
    }, {});

    // Mark seats as selected in the seat map
    const seatMap = seatMapResult.rows.map((seat: any) => ({
      ...seat,
      is_selected: !!selectedSeats[seat.seat_number],
      passenger_id: selectedSeats[seat.seat_number] || null
    }));

    res.json({
      success: true,
      flight: {
        id: flight.id,
        flight_number: flight.flight_number,
        aircraft_model: flight.model,
        total_seats: flight.total_seats
      },
      seatMap
    });

  } catch (error: any) {
    console.error('Error fetching seat map:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat map',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Select seat for a passenger
 * POST /api/seats/select
 */
export const selectSeat = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId, passengerId, flightId, seatNumber } = req.body;

    if (!bookingId || !passengerId || !flightId || !seatNumber) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, passenger ID, flight ID, and seat number are required'
      });
    }

    await client.query('BEGIN');

    // Check if seat is available in the seat map
    const seatMapQuery = `
      SELECT sm.*, a.id as aircraft_id
      FROM seat_maps sm
      JOIN aircraft a ON sm.aircraft_id = a.id
      JOIN flights f ON f.aircraft_id = a.id
      WHERE f.id = $1 AND sm.seat_number = $2
    `;
    const seatMapResult = await client.query(seatMapQuery, [flightId, seatNumber]);

    if (seatMapResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Seat not found in aircraft configuration'
      });
    }

    const seat = seatMapResult.rows[0];

    if (!seat.is_available_for_selection) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Seat is not available for selection'
      });
    }

    // Check if seat is already taken
    const selectionCheckQuery = `
      SELECT * FROM seat_selections
      WHERE flight_id = $1 AND seat_number = $2
    `;
    const selectionCheckResult = await client.query(selectionCheckQuery, [flightId, seatNumber]);

    if (selectionCheckResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Seat is already taken'
      });
    }

    // Check if passenger already has a seat selected
    const existingSeatQuery = `
      SELECT * FROM seat_selections
      WHERE passenger_id = $1 AND flight_id = $2
    `;
    const existingSeatResult = await client.query(existingSeatQuery, [passengerId, flightId]);

    if (existingSeatResult.rows.length > 0) {
      // Delete existing seat selection
      await client.query(
        'DELETE FROM seat_selections WHERE passenger_id = $1 AND flight_id = $2',
        [passengerId, flightId]
      );
    }

    // Insert new seat selection
    const insertQuery = `
      INSERT INTO seat_selections (booking_id, passenger_id, flight_id, seat_number, seat_class, extra_charge)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      bookingId,
      passengerId,
      flightId,
      seatNumber,
      seat.class,
      seat.extra_price || 0
    ]);

    // Also update passenger record
    await client.query(
      'UPDATE passengers SET seat_number = $1 WHERE id = $2',
      [seatNumber, passengerId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Seat selected successfully',
      seatSelectionId: result.rows[0].id,
      seatNumber,
      extraCharge: seat.extra_price || 0
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error selecting seat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to select seat',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Get passenger seat selections
 * GET /api/seats/booking/:bookingId
 */
export const getBookingSeatSelections = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { bookingId } = req.params;

    const query = `
      SELECT ss.*, p.first_name, p.last_name,
             f.flight_number, f.departure_airport, f.arrival_airport
      FROM seat_selections ss
      JOIN passengers p ON ss.passenger_id = p.id
      JOIN flights f ON ss.flight_id = f.id
      WHERE ss.booking_id = $1
    `;

    const result = await client.query(query, [bookingId]);

    res.json({
      success: true,
      seatSelections: result.rows
    });

  } catch (error: any) {
    console.error('Error fetching seat selections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat selections',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Initialize seat map for an aircraft
 * POST /api/seats/initialize-aircraft
 * Admin only - creates seat map for an aircraft
 */
export const initializeAircraftSeats = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const { aircraftId } = req.body;

    if (!aircraftId) {
      return res.status(400).json({
        success: false,
        message: 'Aircraft ID is required'
      });
    }

    // Get aircraft details
    const aircraftQuery = 'SELECT * FROM aircraft WHERE id = $1';
    const aircraftResult = await client.query(aircraftQuery, [aircraftId]);

    if (aircraftResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aircraft not found'
      });
    }

    const aircraft = aircraftResult.rows[0];

    // Check if seats already exist
    const existingSeatsQuery = 'SELECT COUNT(*) FROM seat_maps WHERE aircraft_id = $1';
    const existingResult = await client.query(existingSeatsQuery, [aircraftId]);

    if (parseInt(existingResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Seat map already exists for this aircraft'
      });
    }

    await client.query('BEGIN');

    // Create seat map based on aircraft configuration
    // Standard layout: A-F columns (A, B, C = left; D, E, F = right)
    const seats = [];
    let currentRow = 1;

    // First class (rows 1-2)
    if (aircraft.first_class_seats > 0) {
      const firstClassRows = Math.ceil(aircraft.first_class_seats / 4);
      for (let row = currentRow; row < currentRow + firstClassRows; row++) {
        for (const col of ['A', 'C', 'D', 'F']) {
          seats.push({
            seat_number: `${row}${col}`,
            row_number: row,
            column_letter: col,
            class: 'first',
            type: col === 'A' || col === 'F' ? 'window' : 'aisle',
            extra_price: 0
          });
        }
      }
      currentRow += firstClassRows;
    }

    // Business class (following rows)
    if (aircraft.business_seats > 0) {
      const businessClassRows = Math.ceil(aircraft.business_seats / 4);
      for (let row = currentRow; row < currentRow + businessClassRows; row++) {
        for (const col of ['A', 'C', 'D', 'F']) {
          seats.push({
            seat_number: `${row}${col}`,
            row_number: row,
            column_letter: col,
            class: 'business',
            type: col === 'A' || col === 'F' ? 'window' : 'aisle',
            extra_price: 0
          });
        }
      }
      currentRow += businessClassRows;
    }

    // Economy class (remaining rows)
    if (aircraft.economy_seats > 0) {
      const economyClassRows = Math.ceil(aircraft.economy_seats / 6);
      for (let row = currentRow; row < currentRow + economyClassRows; row++) {
        for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
          const type = col === 'A' || col === 'F' ? 'window' :
                      col === 'C' || col === 'D' ? 'aisle' : 'middle';

          // Exit rows get extra legroom (every 10th row)
          const isExitRow = row % 10 === 0;

          seats.push({
            seat_number: `${row}${col}`,
            row_number: row,
            column_letter: col,
            class: 'economy',
            type: isExitRow ? 'exit_row' : type === 'middle' && row < currentRow + 5 ? 'standard' : type,
            extra_price: isExitRow ? 25 : type === 'aisle' || type === 'window' ? 10 : 0
          });
        }
      }
    }

    // Insert all seats
    for (const seat of seats) {
      await client.query(
        `INSERT INTO seat_maps (aircraft_id, seat_number, row_number, column_letter, class, type, extra_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [aircraftId, seat.seat_number, seat.row_number, seat.column_letter, seat.class, seat.type, seat.extra_price]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Seat map created successfully',
      seatsCreated: seats.length
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error initializing aircraft seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize aircraft seats',
      error: error.message
    });
  } finally {
    client.release();
  }
};
