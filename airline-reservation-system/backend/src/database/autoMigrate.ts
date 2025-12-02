import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-migrate database on startup
 * This runs migrations automatically when the server starts
 */
export const runAutoMigration = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    console.log('🔄 Checking database schema...\n');

    // Check if tables already exist
    const tableCheck = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const tableCount = parseInt(tableCheck.rows[0].table_count);

    if (tableCount > 0) {
      console.log(`✅ Database already initialized (${tableCount} tables found)`);
      // Don't return - still need to check if seeding is needed
    } else {
      console.log('📋 No tables found. Running initial migration...\n');

      // Read schema file from src directory (not dist)
      // __dirname will be in dist/database, so go up to project root then into src
      const schemaPath = path.join(__dirname, '../../src/database/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

      // Execute schema
      await client.query(schemaSql);

      console.log('✅ Database schema created successfully!\n');

      // Verify tables were created
      const result = await client.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `);

      console.log(`📊 Total tables created: ${result.rows[0].table_count}\n`);
    }

    // Always check if seeding is needed (whether tables were just created or already existed)
    await runAutoSeed(client);

  } catch (error: any) {
    console.error('❌ Auto-migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Auto-seed sample data on fresh database
 */
const runAutoSeed = async (client: any): Promise<void> => {
  try {
    // Check if flights table has data (most comprehensive check)
    const flightCheck = await client.query('SELECT COUNT(*) FROM flights');
    const flightCount = parseInt(flightCheck.rows[0].count);

    if (flightCount > 0) {
      console.log('✅ Sample data already exists, skipping seed');
      return;
    }

    console.log('🌱 Seeding sample data...\n');

    // Basic seed data - Airlines
    const airlines = [
      { code: 'AA', name: 'American Airlines', country: 'USA', logo_url: 'https://logo.clearbit.com/aa.com' },
      { code: 'UA', name: 'United Airlines', country: 'USA', logo_url: 'https://logo.clearbit.com/united.com' },
      { code: 'DL', name: 'Delta Air Lines', country: 'USA', logo_url: 'https://logo.clearbit.com/delta.com' },
      { code: 'BA', name: 'British Airways', country: 'GBR', logo_url: 'https://logo.clearbit.com/britishairways.com' },
      { code: 'EK', name: 'Emirates', country: 'ARE', logo_url: 'https://logo.clearbit.com/emirates.com' },
    ];

    for (const airline of airlines) {
      await client.query(
        'INSERT INTO airlines (code, name, country, logo_url) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [airline.code, airline.name, airline.country, airline.logo_url]
      );
    }

    // Basic seed data - Airports
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', timezone: 'America/New_York' },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
      { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
      { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'GBR', timezone: 'Europe/London' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'ARE', timezone: 'Asia/Dubai' },
      { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles' },
      { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', timezone: 'America/New_York' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'FRA', timezone: 'Europe/Paris' },
    ];

    for (const airport of airports) {
      await client.query(
        'INSERT INTO airports (code, name, city, country, timezone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
        [airport.code, airport.name, airport.city, airport.country, airport.timezone]
      );
    }

    // Basic seed data - Aircraft
    const aircraftResult = await client.query(`
      INSERT INTO aircraft (model, manufacturer, total_seats, economy_seats, business_seats, first_class_seats)
      VALUES
        ('Boeing 737', 'Boeing', 180, 150, 20, 10),
        ('Airbus A320', 'Airbus', 186, 156, 20, 10),
        ('Boeing 777', 'Boeing', 350, 280, 50, 20)
      RETURNING id
    `);

    const aircraftIds = aircraftResult.rows.map((row: any) => row.id);

    // Basic seed data - Sample Flights
    // Create flights for the next 30 days (to support longer round trips)
    const today = new Date();
    const flights = [];

    // JFK to LAX (multiple times per day)
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      // Morning flight
      const morningDep = new Date(flightDate);
      morningDep.setHours(8, 0, 0, 0);
      const morningArr = new Date(morningDep);
      morningArr.setHours(morningArr.getHours() + 6); // 6 hour flight

      flights.push({
        flight_number: 'AA100',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'JFK',
        arrival_airport: 'LAX',
        departure_time: morningDep,
        arrival_time: morningArr,
        duration: 360,
        base_price_economy: 299.99,
        base_price_business: 899.99,
        base_price_first: 1499.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });

      // Evening flight
      const eveningDep = new Date(flightDate);
      eveningDep.setHours(18, 30, 0, 0);
      const eveningArr = new Date(eveningDep);
      eveningArr.setHours(eveningArr.getHours() + 6);

      flights.push({
        flight_number: 'DL200',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'JFK',
        arrival_airport: 'LAX',
        departure_time: eveningDep,
        arrival_time: eveningArr,
        duration: 360,
        base_price_economy: 279.99,
        base_price_business: 849.99,
        base_price_first: 1399.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // LAX to JFK
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(9, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 5, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA300',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'LAX',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 330,
        base_price_economy: 289.99,
        base_price_business: 879.99,
        base_price_first: 1449.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // JFK to LHR (international)
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(22, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 7);

      flights.push({
        flight_number: 'BA101',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'JFK',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 420,
        base_price_economy: 599.99,
        base_price_business: 2499.99,
        base_price_first: 4999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // Insert all flights
    for (const flight of flights) {
      await client.query(
        `INSERT INTO flights (flight_number, airline_code, aircraft_id, departure_airport, arrival_airport,
         departure_time, arrival_time, duration, base_price_economy, base_price_business, base_price_first,
         available_seats_economy, available_seats_business, available_seats_first, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled')`,
        [
          flight.flight_number,
          flight.airline_code,
          flight.aircraft_id,
          flight.departure_airport,
          flight.arrival_airport,
          flight.departure_time,
          flight.arrival_time,
          flight.duration,
          flight.base_price_economy,
          flight.base_price_business,
          flight.base_price_first,
          flight.available_seats_economy,
          flight.available_seats_business,
          flight.available_seats_first
        ]
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log(`   - ${airlines.length} airlines`);
    console.log(`   - ${airports.length} airports`);
    console.log(`   - ${aircraftResult.rows.length} aircraft`);
    console.log(`   - ${flights.length} flights\n`);

  } catch (error: any) {
    console.error('⚠️  Seeding failed (non-critical):', error.message);
    // Don't throw - seeding failure shouldn't prevent server startup
  }
};
