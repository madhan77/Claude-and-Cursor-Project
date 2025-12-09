import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-migrate database on startup
 * This runs migrations automatically when the server starts
 */
export const runAutoMigration = async (): Promise<void> => {
  let client;

  try {
    // Try to connect to database with timeout
    client = await pool.connect();
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

    // Run new features migration if needed
    await runNewFeaturesMigration(client);

    // Always check if seeding is needed (whether tables were just created or already existed)
    await runAutoSeed(client);

  } catch (error: any) {
    console.error('❌ Auto-migration failed:', error.message);
    console.error('Error details:', error);
    console.warn('⚠️  Database not available - server will start without migrations');
    console.warn('⚠️  Please ensure DATABASE_URL is set correctly in Render environment variables');
    // Don't throw - let server start anyway
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * Run new features migration
 * Adds tables for seat selection, baggage, meals, insurance, loyalty, etc.
 */
const runNewFeaturesMigration = async (client: any): Promise<void> => {
  try {
    // Check if new feature tables exist (check for seat_maps as indicator)
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'seat_maps'
      ) as exists
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ New feature tables already exist, skipping migration\n');
      return;
    }

    console.log('🆕 Running new features migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../../src/database/migrations/add-new-features.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration
    await client.query(migrationSql);

    console.log('✅ New features migration completed successfully!\n');

    // Verify new tables were created
    const newTableCheck = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log(`📊 Total tables now: ${newTableCheck.rows[0].table_count}\n`);

  } catch (error: any) {
    console.error('❌ New features migration failed:', error.message);
    throw error;
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

    // We expect at least 40000 flights (54 routes × 730 days ≈ 40,000 flights)
    // If less, delete old data and re-seed with updated 2-year flights
    if (flightCount > 0 && flightCount < 40000) {
      console.log(`⚠️  Only ${flightCount} flights found, expected 40,000+. Re-seeding...`);

      // Delete in correct order to respect foreign key constraints
      await client.query('DELETE FROM ancillary_services');
      await client.query('DELETE FROM passengers');
      await client.query('DELETE FROM booking_flights');
      await client.query('DELETE FROM bookings');
      await client.query('DELETE FROM seats');
      await client.query('DELETE FROM flights');

      console.log('✅ Old data cleared, re-seeding...');
    } else if (flightCount >= 40000) {
      console.log(`✅ Sample data already exists (${flightCount} flights), skipping seed`);
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
    // Create flights for the next 2 years (730 days) to support extended booking windows
    const today = new Date();
    const flights = [];

    // JFK to LAX (multiple times per day)
    for (let day = 0; day < 730; day++) {
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
    for (let day = 0; day < 730; day++) {
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
    for (let day = 0; day < 730; day++) {
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

    // LHR to JFK (return flight)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(11, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 8); // 8 hours westbound

      flights.push({
        flight_number: 'BA102',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 480,
        base_price_economy: 649.99,
        base_price_business: 2599.99,
        base_price_first: 5199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // JFK to SFO
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(10, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 6, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA500',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'JFK',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 390,
        base_price_economy: 279.99,
        base_price_business: 849.99,
        base_price_first: 1399.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // SFO to JFK
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(7, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 5, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA501',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'SFO',
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

    // JFK to MIA
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(13, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 3);

      flights.push({
        flight_number: 'AA400',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'JFK',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 180,
        base_price_economy: 199.99,
        base_price_business: 599.99,
        base_price_first: 999.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // MIA to JFK
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 3);

      flights.push({
        flight_number: 'AA401',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'MIA',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 180,
        base_price_economy: 189.99,
        base_price_business: 579.99,
        base_price_first: 949.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // LAX to SFO
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(11, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 1, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL600',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'LAX',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 90,
        base_price_economy: 129.99,
        base_price_business: 399.99,
        base_price_first: 649.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // SFO to LAX
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(17, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 1, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL601',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'SFO',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 90,
        base_price_economy: 119.99,
        base_price_business: 379.99,
        base_price_first: 629.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // JFK to CDG (Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(20, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 7, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL410',
        airline_code: 'DL',
        aircraft_id: aircraftIds[2],
        departure_airport: 'JFK',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 450,
        base_price_economy: 579.99,
        base_price_business: 2399.99,
        base_price_first: 4799.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // CDG to JFK (return)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(12, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 8, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL411',
        airline_code: 'DL',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 510,
        base_price_economy: 599.99,
        base_price_business: 2449.99,
        base_price_first: 4899.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // JFK to ORD (Chicago)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(14, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 2, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA700',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'JFK',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 150,
        base_price_economy: 179.99,
        base_price_business: 549.99,
        base_price_first: 899.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // ORD to JFK
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(18, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 2, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA701',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'ORD',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 150,
        base_price_economy: 189.99,
        base_price_business: 569.99,
        base_price_first: 929.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // LAX to ORD
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(10, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 4);

      flights.push({
        flight_number: 'AA800',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'LAX',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 240,
        base_price_economy: 229.99,
        base_price_business: 699.99,
        base_price_first: 1149.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // ORD to LAX
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(15, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 4, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'AA801',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'ORD',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 270,
        base_price_economy: 239.99,
        base_price_business: 719.99,
        base_price_first: 1179.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // LAX to MIA
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(8, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 5);

      flights.push({
        flight_number: 'DL900',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'LAX',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 300,
        base_price_economy: 259.99,
        base_price_business: 789.99,
        base_price_first: 1299.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // MIA to LAX
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(12, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 5, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL901',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'MIA',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 330,
        base_price_economy: 269.99,
        base_price_business: 799.99,
        base_price_first: 1319.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // SFO to ORD
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(9, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 4);

      flights.push({
        flight_number: 'UA600',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'SFO',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 240,
        base_price_economy: 219.99,
        base_price_business: 669.99,
        base_price_first: 1099.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // ORD to SFO
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 4, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA601',
        airline_code: 'UA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'ORD',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 270,
        base_price_economy: 229.99,
        base_price_business: 689.99,
        base_price_first: 1129.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // SFO to MIA
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(7, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 5, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'AA900',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'SFO',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 330,
        base_price_economy: 279.99,
        base_price_business: 849.99,
        base_price_first: 1399.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // MIA to SFO
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(14, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 6);

      flights.push({
        flight_number: 'AA901',
        airline_code: 'AA',
        aircraft_id: aircraftIds[0],
        departure_airport: 'MIA',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 360,
        base_price_economy: 289.99,
        base_price_business: 879.99,
        base_price_first: 1449.99,
        available_seats_economy: 150,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // ORD to MIA
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(11, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 3);

      flights.push({
        flight_number: 'DL700',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'ORD',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 180,
        base_price_economy: 199.99,
        base_price_business: 609.99,
        base_price_first: 999.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // MIA to ORD
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(19, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 3);

      flights.push({
        flight_number: 'DL701',
        airline_code: 'DL',
        aircraft_id: aircraftIds[1],
        departure_airport: 'MIA',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 180,
        base_price_economy: 209.99,
        base_price_business: 629.99,
        base_price_first: 1029.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // ===== DUBAI (DXB) INTERNATIONAL ROUTES =====

    // CDG to DXB (Paris to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(15, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 6, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK076',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 390,
        base_price_economy: 699.99,
        base_price_business: 2999.99,
        base_price_first: 5999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to CDG (Dubai to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(8, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 7);

      flights.push({
        flight_number: 'EK077',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 420,
        base_price_economy: 729.99,
        base_price_business: 3099.99,
        base_price_first: 6199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // JFK to DXB (New York to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(23, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 12, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK202',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'JFK',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 750,
        base_price_economy: 899.99,
        base_price_business: 3999.99,
        base_price_first: 7999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to JFK (Dubai to New York)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(9, 45, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 14);

      flights.push({
        flight_number: 'EK203',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'JFK',
        departure_time: dep,
        arrival_time: arr,
        duration: 840,
        base_price_economy: 949.99,
        base_price_business: 4199.99,
        base_price_first: 8299.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LAX to DXB (Los Angeles to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 16);

      flights.push({
        flight_number: 'EK216',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LAX',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 960,
        base_price_economy: 999.99,
        base_price_business: 4499.99,
        base_price_first: 8999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to LAX (Dubai to Los Angeles)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(2, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 16, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK217',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 990,
        base_price_economy: 1029.99,
        base_price_business: 4599.99,
        base_price_first: 9199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LHR to DXB (London to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(21, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 7);

      flights.push({
        flight_number: 'EK004',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 420,
        base_price_economy: 649.99,
        base_price_business: 2799.99,
        base_price_first: 5599.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to LHR (Dubai to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(14, 45, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 7, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK005',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 450,
        base_price_economy: 679.99,
        base_price_business: 2899.99,
        base_price_first: 5799.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // ORD to DXB (Chicago to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(22, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 13);

      flights.push({
        flight_number: 'EK236',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'ORD',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 780,
        base_price_economy: 879.99,
        base_price_business: 3899.99,
        base_price_first: 7799.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to ORD (Dubai to Chicago)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(10, 15, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 14, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK237',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 870,
        base_price_economy: 919.99,
        base_price_business: 4099.99,
        base_price_first: 8199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // SFO to DXB (San Francisco to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(15, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 15, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK226',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'SFO',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 930,
        base_price_economy: 979.99,
        base_price_business: 4399.99,
        base_price_first: 8799.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to SFO (Dubai to San Francisco)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(3, 15, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 16);

      flights.push({
        flight_number: 'EK227',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 960,
        base_price_economy: 1009.99,
        base_price_business: 4499.99,
        base_price_first: 8999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // MIA to DXB (Miami to Dubai)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(21, 45, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 13, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'EK214',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'MIA',
        arrival_airport: 'DXB',
        departure_time: dep,
        arrival_time: arr,
        duration: 810,
        base_price_economy: 899.99,
        base_price_business: 3999.99,
        base_price_first: 7999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // DXB to MIA (Dubai to Miami)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(8, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 15);

      flights.push({
        flight_number: 'EK215',
        airline_code: 'EK',
        aircraft_id: aircraftIds[2],
        departure_airport: 'DXB',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 900,
        base_price_economy: 939.99,
        base_price_business: 4199.99,
        base_price_first: 8399.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // ===== ADDITIONAL EUROPEAN ROUTES =====

    // LHR to CDG (London to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(9, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 1, arr.getMinutes() + 15);

      flights.push({
        flight_number: 'BA308',
        airline_code: 'BA',
        aircraft_id: aircraftIds[1],
        departure_airport: 'LHR',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 75,
        base_price_economy: 149.99,
        base_price_business: 449.99,
        base_price_first: 749.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // CDG to LHR (Paris to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(18, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 1, arr.getMinutes() + 15);

      flights.push({
        flight_number: 'BA309',
        airline_code: 'BA',
        aircraft_id: aircraftIds[1],
        departure_airport: 'CDG',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 75,
        base_price_economy: 159.99,
        base_price_business: 469.99,
        base_price_first: 769.99,
        available_seats_economy: 156,
        available_seats_business: 20,
        available_seats_first: 10
      });
    }

    // LHR to LAX (London to Los Angeles)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(10, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11);

      flights.push({
        flight_number: 'BA268',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 660,
        base_price_economy: 649.99,
        base_price_business: 2699.99,
        base_price_first: 5399.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LAX to LHR (Los Angeles to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(19, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 10, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'BA269',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LAX',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 630,
        base_price_economy: 679.99,
        base_price_business: 2799.99,
        base_price_first: 5599.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LHR to ORD (London to Chicago)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 9);

      flights.push({
        flight_number: 'BA296',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 540,
        base_price_economy: 599.99,
        base_price_business: 2499.99,
        base_price_first: 4999.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // ORD to LHR (Chicago to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(21, 15, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 8);

      flights.push({
        flight_number: 'BA297',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'ORD',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 480,
        base_price_economy: 629.99,
        base_price_business: 2599.99,
        base_price_first: 5199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // CDG to LAX (Paris to Los Angeles)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(11, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'DL468',
        airline_code: 'DL',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'LAX',
        departure_time: dep,
        arrival_time: arr,
        duration: 690,
        base_price_economy: 669.99,
        base_price_business: 2799.99,
        base_price_first: 5599.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LAX to CDG (Los Angeles to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(20, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11);

      flights.push({
        flight_number: 'DL469',
        airline_code: 'DL',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LAX',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 660,
        base_price_economy: 699.99,
        base_price_business: 2899.99,
        base_price_first: 5799.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // CDG to ORD (Paris to Chicago)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(13, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 9, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'AA48',
        airline_code: 'AA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'ORD',
        departure_time: dep,
        arrival_time: arr,
        duration: 570,
        base_price_economy: 619.99,
        base_price_business: 2599.99,
        base_price_first: 5199.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // ORD to CDG (Chicago to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(17, 45, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 8, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'AA49',
        airline_code: 'AA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'ORD',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 510,
        base_price_economy: 649.99,
        base_price_business: 2699.99,
        base_price_first: 5399.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LHR to SFO (London to San Francisco)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(12, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11);

      flights.push({
        flight_number: 'BA286',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 660,
        base_price_economy: 659.99,
        base_price_business: 2749.99,
        base_price_first: 5499.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // SFO to LHR (San Francisco to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(18, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 10, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'BA287',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'SFO',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 630,
        base_price_economy: 689.99,
        base_price_business: 2849.99,
        base_price_first: 5699.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // CDG to SFO (Paris to San Francisco)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(14, 15, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'UA990',
        airline_code: 'UA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'SFO',
        departure_time: dep,
        arrival_time: arr,
        duration: 690,
        base_price_economy: 679.99,
        base_price_business: 2849.99,
        base_price_first: 5699.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // SFO to CDG (San Francisco to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 11);

      flights.push({
        flight_number: 'UA991',
        airline_code: 'UA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'SFO',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 660,
        base_price_economy: 709.99,
        base_price_business: 2949.99,
        base_price_first: 5899.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // LHR to MIA (London to Miami)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(15, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 9, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'BA206',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'LHR',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 570,
        base_price_economy: 589.99,
        base_price_business: 2449.99,
        base_price_first: 4899.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // MIA to LHR (Miami to London)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(20, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 8, arr.getMinutes() + 30);

      flights.push({
        flight_number: 'BA207',
        airline_code: 'BA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'MIA',
        arrival_airport: 'LHR',
        departure_time: dep,
        arrival_time: arr,
        duration: 510,
        base_price_economy: 619.99,
        base_price_business: 2549.99,
        base_price_first: 5099.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // CDG to MIA (Paris to Miami)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(16, 30, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 10);

      flights.push({
        flight_number: 'AA90',
        airline_code: 'AA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'CDG',
        arrival_airport: 'MIA',
        departure_time: dep,
        arrival_time: arr,
        duration: 600,
        base_price_economy: 609.99,
        base_price_business: 2549.99,
        base_price_first: 5099.99,
        available_seats_economy: 280,
        available_seats_business: 50,
        available_seats_first: 20
      });
    }

    // MIA to CDG (Miami to Paris)
    for (let day = 0; day < 730; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      const dep = new Date(flightDate);
      dep.setHours(22, 0, 0, 0);
      const arr = new Date(dep);
      arr.setHours(arr.getHours() + 9);

      flights.push({
        flight_number: 'AA91',
        airline_code: 'AA',
        aircraft_id: aircraftIds[2],
        departure_airport: 'MIA',
        arrival_airport: 'CDG',
        departure_time: dep,
        arrival_time: arr,
        duration: 540,
        base_price_economy: 639.99,
        base_price_business: 2649.99,
        base_price_first: 5299.99,
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
