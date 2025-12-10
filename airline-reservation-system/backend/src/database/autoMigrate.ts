import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-migrate database on startup
 * This runs migrations automatically when the server starts
 */
export const runAutoMigration = async (): Promise<void> => {
  let client: any = undefined;

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

    console.log('✅ Auto-migration completed successfully\n');

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

