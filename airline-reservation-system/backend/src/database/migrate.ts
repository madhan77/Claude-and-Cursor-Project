import pool from '../config/database';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Running database migration...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await client.query(schemaSql);

    console.log('✅ Database migration completed successfully!\n');

    // Display table count
    const result = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log(`📊 Total tables created: ${result.rows[0].table_count}\n`);

    console.log('╔════════════════════════════════════════╗');
    console.log('║  Migration Summary                     ║');
    console.log('╠════════════════════════════════════════╣');
    console.log('║  ✅ Schema applied                     ║');
    console.log('║  ✅ Tables created                     ║');
    console.log('║  ✅ Indexes created                    ║');
    console.log('║  ✅ Triggers created                   ║');
    console.log('║  ✅ Functions created                  ║');
    console.log('╚════════════════════════════════════════╝');

    console.log('\n💡 Next steps:');
    console.log('   1. Run: npm run seed (to add sample data)');
    console.log('   2. Run: npm run dev (to start the server)\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
