import { Request, Response } from 'express';
import { query } from '../config/database';
import flightAPIService from '../services/flightapi.service';
import cacheService from '../services/cache.service';

export const searchFlights = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      departure_airport,
      arrival_airport,
      departure_date,
      adults = 1,
      children = 0,
      infants = 0,
      class: cabin_class = 'economy',
      max_price,
      airlines,
      sort_by = 'price'
    } = req.query as any;

    // Validation
    if (!departure_airport || !arrival_airport || !departure_date) {
      return res.status(400).json({
        success: false,
        message: 'Departure airport, arrival airport, and departure date are required'
      });
    }

    const totalPassengers = parseInt(adults) + parseInt(children) + parseInt(infants);

    // Build query
    let queryText = `
      SELECT
        f.id, f.flight_number, f.departure_time, f.arrival_time, f.duration,
        f.status, f.gate, f.terminal,
        f.base_price_economy, f.base_price_business, f.base_price_first,
        f.available_seats_economy, f.available_seats_business, f.available_seats_first,
        a.code as airline_code, a.name as airline_name, a.logo_url as airline_logo,
        dep.code as dep_airport_code, dep.name as dep_airport_name, dep.city as dep_city,
        arr.code as arr_airport_code, arr.name as arr_airport_name, arr.city as arr_city,
        ac.model as aircraft_model
      FROM flights f
      JOIN airlines a ON f.airline_code = a.code
      JOIN airports dep ON f.departure_airport = dep.code
      JOIN airports arr ON f.arrival_airport = arr.code
      JOIN aircraft ac ON f.aircraft_id = ac.id
      WHERE f.departure_airport = $1
        AND f.arrival_airport = $2
        AND DATE(f.departure_time) = $3
        AND f.status = 'scheduled'
    `;

    const params: any[] = [departure_airport, arrival_airport, departure_date];
    let paramIndex = 4;

    // Add cabin class availability filter
    if (cabin_class === 'economy') {
      queryText += ` AND f.available_seats_economy >= $${paramIndex}`;
      params.push(totalPassengers);
      paramIndex++;
    } else if (cabin_class === 'business') {
      queryText += ` AND f.available_seats_business >= $${paramIndex}`;
      params.push(totalPassengers);
      paramIndex++;
    } else if (cabin_class === 'first') {
      queryText += ` AND f.available_seats_first >= $${paramIndex}`;
      params.push(totalPassengers);
      paramIndex++;
    }

    // Add max price filter
    if (max_price) {
      if (cabin_class === 'economy') {
        queryText += ` AND f.base_price_economy <= $${paramIndex}`;
      } else if (cabin_class === 'business') {
        queryText += ` AND f.base_price_business <= $${paramIndex}`;
      } else {
        queryText += ` AND f.base_price_first <= $${paramIndex}`;
      }
      params.push(max_price);
      paramIndex++;
    }

    // Add airline filter
    if (airlines && Array.isArray(airlines)) {
      queryText += ` AND f.airline_code = ANY($${paramIndex})`;
      params.push(airlines);
      paramIndex++;
    }

    // Add sorting
    let orderBy = 'f.base_price_economy ASC'; // default
    if (sort_by === 'duration') {
      orderBy = 'f.duration ASC';
    } else if (sort_by === 'departure') {
      orderBy = 'f.departure_time ASC';
    } else if (sort_by === 'arrival') {
      orderBy = 'f.arrival_time ASC';
    } else if (cabin_class === 'business') {
      orderBy = 'f.base_price_business ASC';
    } else if (cabin_class === 'first') {
      orderBy = 'f.base_price_first ASC';
    }

    queryText += ` ORDER BY ${orderBy}`;

    const result = await query(queryText, params);

    // Format results
    let flights = result.rows.map((row: any) => ({
      id: row.id,
      flight_number: row.flight_number,
      airline: {
        code: row.airline_code,
        name: row.airline_name,
        logo: row.airline_logo
      },
      departure: {
        airport: row.dep_airport_code,
        name: row.dep_airport_name,
        city: row.dep_city,
        time: row.departure_time,
        terminal: row.terminal,
        gate: row.gate
      },
      arrival: {
        airport: row.arr_airport_code,
        name: row.arr_airport_name,
        city: row.arr_city,
        time: row.arrival_time
      },
      duration: row.duration,
      aircraft: row.aircraft_model,
      status: row.status,
      price: {
        economy: row.base_price_economy,
        business: row.base_price_business,
        first: row.base_price_first
      },
      available_seats: {
        economy: row.available_seats_economy,
        business: row.available_seats_business,
        first: row.available_seats_first
      }
    }));

    // Enrich with real-time flight status from Aviationstack API
    // This is done asynchronously and won't block if API fails
    flights = await enrichFlightsWithRealTimeData(flights, departure_date);

    return res.status(200).json({
      success: true,
      data: flights,
      count: flights.length,
      filters: {
        departure_airport,
        arrival_airport,
        departure_date,
        passengers: { adults, children, infants },
        class: cabin_class
      },
      realtime_data: flights.some((f: any) => f.realtime_updated) // Indicates if any real-time data was fetched
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search flights',
      error: error.message
    });
  }
};

/**
 * Enriches flight data with real-time status from Aviationstack API
 * Uses caching to minimize API calls (100 requests/month free tier)
 * Gracefully handles API failures - returns original data if API unavailable
 */
const enrichFlightsWithRealTimeData = async (flights: any[], departure_date: string): Promise<any[]> => {
  try {
    // Process flights concurrently but with a limit to avoid hammering the API
    const enrichedFlights = await Promise.all(
      flights.map(async (flight) => {
        try {
          // Create cache key
          const cacheKey = `flight_${flight.flight_number}_${departure_date}`;

          // Check cache first
          let realtimeData = cacheService.get(cacheKey);

          if (!realtimeData) {
            // Fetch from API (only if not in cache)
            console.log(`📡 Fetching real-time data for ${flight.flight_number}`);
            realtimeData = await flightAPIService.getFlightStatus(flight.flight_number, departure_date);

            // Cache the result (even if null) to avoid repeated failed requests
            cacheService.set(cacheKey, realtimeData);
          } else {
            console.log(`💾 Using cached data for ${flight.flight_number}`);
          }

          // Merge real-time data if available
          if (realtimeData) {
            return {
              ...flight,
              status: realtimeData.status || flight.status,
              departure: {
                ...flight.departure,
                time: realtimeData.departure.scheduled_time || flight.departure.time,
                actual_time: realtimeData.departure.actual_time,
                terminal: realtimeData.departure.terminal || flight.departure.terminal,
                gate: realtimeData.departure.gate || flight.departure.gate,
              },
              arrival: {
                ...flight.arrival,
                time: realtimeData.arrival.scheduled_time || flight.arrival.time,
                actual_time: realtimeData.arrival.actual_time,
              },
              aircraft: realtimeData.aircraft || flight.aircraft,
              realtime_updated: true,
              realtime_status: realtimeData.status
            };
          }

          return flight;
        } catch (flightError) {
          // If individual flight enrichment fails, just return original data
          console.warn(`⚠️  Failed to enrich ${flight.flight_number}:`, flightError);
          return flight;
        }
      })
    );

    return enrichedFlights;
  } catch (error) {
    // If entire enrichment process fails, return original flights
    console.error('❌ Real-time enrichment failed:', error);
    return flights;
  }
};

export const getFlightById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        f.*,
        a.name as airline_name, a.logo_url as airline_logo,
        dep.name as dep_airport_name, dep.city as dep_city, dep.country as dep_country,
        arr.name as arr_airport_name, arr.city as arr_city, arr.country as arr_country,
        ac.model as aircraft_model, ac.total_seats
      FROM flights f
      JOIN airlines a ON f.airline_code = a.code
      JOIN airports dep ON f.departure_airport = dep.code
      JOIN airports arr ON f.arrival_airport = arr.code
      JOIN aircraft ac ON f.aircraft_id = ac.id
      WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    const flight = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: flight.id,
        flight_number: flight.flight_number,
        airline: {
          code: flight.airline_code,
          name: flight.airline_name,
          logo: flight.airline_logo
        },
        departure: {
          airport: flight.departure_airport,
          name: flight.dep_airport_name,
          city: flight.dep_city,
          country: flight.dep_country,
          time: flight.departure_time,
          terminal: flight.terminal,
          gate: flight.gate
        },
        arrival: {
          airport: flight.arrival_airport,
          name: flight.arr_airport_name,
          city: flight.arr_city,
          country: flight.arr_country,
          time: flight.arrival_time
        },
        duration: flight.duration,
        aircraft: {
          model: flight.aircraft_model,
          total_seats: flight.total_seats
        },
        status: flight.status,
        price: {
          economy: flight.base_price_economy,
          business: flight.base_price_business,
          first: flight.base_price_first
        },
        available_seats: {
          economy: flight.available_seats_economy,
          business: flight.available_seats_business,
          first: flight.available_seats_first
        }
      }
    });
  } catch (error: any) {
    console.error('Get flight error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get flight',
      error: error.message
    });
  }
};

export const getFlightSeats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if flight exists
    const flightResult = await query('SELECT id FROM flights WHERE id = $1', [id]);

    if (flightResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    // Get seats
    const seatsResult = await query(
      `SELECT id, seat_number, class, type, is_available, extra_price
       FROM seats
       WHERE flight_id = $1
       ORDER BY seat_number`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: seatsResult.rows
    });
  } catch (error: any) {
    console.error('Get seats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get seats',
      error: error.message
    });
  }
};

export const getAirports = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { search } = req.query;

    let queryText = 'SELECT code, name, city, country FROM airports';
    const params: any[] = [];

    if (search) {
      queryText += ' WHERE name ILIKE $1 OR city ILIKE $1 OR code ILIKE $1';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY name LIMIT 50';

    const result = await query(queryText, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Get airports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get airports',
      error: error.message
    });
  }
};

export const getAirlines = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const result = await query(
      'SELECT code, name, logo_url, country FROM airlines ORDER BY name'
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Get airlines error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get airlines',
      error: error.message
    });
  }
};
