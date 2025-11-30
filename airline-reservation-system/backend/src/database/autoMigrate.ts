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
      return;
    }

    console.log('📋 No tables found. Running initial migration...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
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

    // Auto-seed sample data if database is fresh
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
    // Check if airlines table has data
    const airlineCheck = await client.query('SELECT COUNT(*) FROM airlines');
    const airlineCount = parseInt(airlineCheck.rows[0].count);

    if (airlineCount > 0) {
      console.log('✅ Sample data already exists, skipping seed');
      return;
    }

    console.log('🌱 Seeding sample data...\n');

    // Basic seed data - Airlines
    const airlines = [
      { code: 'AA', name: 'American Airlines', country: 'United States', logo_url: 'https://logo.clearbit.com/aa.com' },
      { code: 'UA', name: 'United Airlines', country: 'United States', logo_url: 'https://logo.clearbit.com/united.com' },
      { code: 'DL', name: 'Delta Air Lines', country: 'United States', logo_url: 'https://logo.clearbit.com/delta.com' },
      { code: 'BA', name: 'British Airways', country: 'United Kingdom', logo_url: 'https://logo.clearbit.com/britishairways.com' },
      { code: 'EK', name: 'Emirates', country: 'United Arab Emirates', logo_url: 'https://logo.clearbit.com/emirates.com' },
    ];

    for (const airline of airlines) {
      await client.query(
        'INSERT INTO airlines (code, name, country, logo_url) VALUES ($1, $2, $3, $4)',
        [airline.code, airline.name, airline.country, airline.logo_url]
      );
    }

    // Basic seed data - Airports
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', timezone: 'America/New_York' },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
      { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', timezone: 'America/Chicago' },
      { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },
      { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles' },
      { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', timezone: 'America/New_York' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
    ];

    for (const airport of airports) {
      await client.query(
        'INSERT INTO airports (code, name, city, country, timezone) VALUES ($1, $2, $3, $4, $5)',
        [airport.code, airport.name, airport.city, airport.country, airport.timezone]
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log(`   - ${airlines.length} airlines`);
    console.log(`   - ${airports.length} airports\n`);

  } catch (error: any) {
    console.error('⚠️  Seeding failed (non-critical):', error.message);
    // Don't throw - seeding failure shouldn't prevent server startup
  }
};
