import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...\n');

    // Seed Airlines
    console.log('Adding airlines...');
    await client.query(`
      INSERT INTO airlines (code, name, country) VALUES
      ('AA', 'American Airlines', 'USA'),
      ('UA', 'United Airlines', 'USA'),
      ('DL', 'Delta Air Lines', 'USA'),
      ('BA', 'British Airways', 'GBR'),
      ('LH', 'Lufthansa', 'DEU'),
      ('AF', 'Air France', 'FRA'),
      ('EK', 'Emirates', 'ARE'),
      ('QR', 'Qatar Airways', 'QAT'),
      ('SQ', 'Singapore Airlines', 'SGP'),
      ('JL', 'Japan Airlines', 'JPN')
      ON CONFLICT (code) DO NOTHING
    `);

    // Seed Airports
    console.log('Adding airports...');
    await client.query(`
      INSERT INTO airports (code, name, city, country, timezone) VALUES
      ('JFK', 'John F. Kennedy International Airport', 'New York', 'USA', 'America/New_York'),
      ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA', 'America/Los_Angeles'),
      ('ORD', 'O''Hare International Airport', 'Chicago', 'USA', 'America/Chicago'),
      ('ATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'USA', 'America/New_York'),
      ('DFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'USA', 'America/Chicago'),
      ('SFO', 'San Francisco International Airport', 'San Francisco', 'USA', 'America/Los_Angeles'),
      ('LHR', 'London Heathrow Airport', 'London', 'GBR', 'Europe/London'),
      ('CDG', 'Charles de Gaulle Airport', 'Paris', 'FRA', 'Europe/Paris'),
      ('FRA', 'Frankfurt Airport', 'Frankfurt', 'DEU', 'Europe/Berlin'),
      ('DXB', 'Dubai International Airport', 'Dubai', 'ARE', 'Asia/Dubai'),
      ('SIN', 'Singapore Changi Airport', 'Singapore', 'SGP', 'Asia/Singapore'),
      ('NRT', 'Narita International Airport', 'Tokyo', 'JPN', 'Asia/Tokyo'),
      ('HND', 'Tokyo Haneda Airport', 'Tokyo', 'JPN', 'Asia/Tokyo'),
      ('MIA', 'Miami International Airport', 'Miami', 'USA', 'America/New_York'),
      ('BOS', 'Boston Logan International Airport', 'Boston', 'USA', 'America/New_York')
      ON CONFLICT (code) DO NOTHING
    `);

    // Seed Aircraft
    console.log('Adding aircraft...');
    const aircraftResult = await client.query(`
      INSERT INTO aircraft (model, manufacturer, total_seats, economy_seats, business_seats, first_class_seats) VALUES
      ('Boeing 737-800', 'Boeing', 175, 150, 20, 5),
      ('Airbus A320', 'Airbus', 180, 156, 20, 4),
      ('Boeing 777-300ER', 'Boeing', 350, 280, 50, 20),
      ('Airbus A350-900', 'Airbus', 325, 260, 45, 20),
      ('Boeing 787-9 Dreamliner', 'Boeing', 296, 234, 48, 14),
      ('Airbus A380', 'Airbus', 525, 400, 85, 40)
      RETURNING id, model
    `);

    const aircraft = aircraftResult.rows;

    // Seed Flights
    console.log('Adding flights...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const flights = [
      // JFK to LAX
      {
        number: 'AA101',
        airline: 'AA',
        from: 'JFK',
        to: 'LAX',
        depTime: new Date(tomorrow.setHours(8, 0, 0)),
        duration: 360,
        aircraft: aircraft[2].id,
        priceEcon: 299,
        priceBus: 899,
        priceFirst: 1899
      },
      {
        number: 'UA202',
        airline: 'UA',
        from: 'JFK',
        to: 'LAX',
        depTime: new Date(tomorrow.setHours(14, 30, 0)),
        duration: 350,
        aircraft: aircraft[1].id,
        priceEcon: 279,
        priceBus: 849,
        priceFirst: 1799
      },
      // LAX to JFK
      {
        number: 'DL303',
        airline: 'DL',
        from: 'LAX',
        to: 'JFK',
        depTime: new Date(tomorrow.setHours(10, 0, 0)),
        duration: 330,
        aircraft: aircraft[0].id,
        priceEcon: 289,
        priceBus: 879,
        priceFirst: 1849
      },
      // JFK to LHR
      {
        number: 'BA100',
        airline: 'BA',
        from: 'JFK',
        to: 'LHR',
        depTime: new Date(tomorrow.setHours(20, 0, 0)),
        duration: 420,
        aircraft: aircraft[3].id,
        priceEcon: 599,
        priceBus: 2499,
        priceFirst: 5999
      },
      // LHR to JFK
      {
        number: 'BA101',
        airline: 'BA',
        from: 'LHR',
        to: 'JFK',
        depTime: new Date(tomorrow.setHours(11, 0, 0)),
        duration: 480,
        aircraft: aircraft[3].id,
        priceEcon: 649,
        priceBus: 2699,
        priceFirst: 6299
      },
      // SFO to NRT
      {
        number: 'JL001',
        airline: 'JL',
        from: 'SFO',
        to: 'NRT',
        depTime: new Date(tomorrow.setHours(13, 0, 0)),
        duration: 660,
        aircraft: aircraft[4].id,
        priceEcon: 899,
        priceBus: 3999,
        priceFirst: 8999
      },
      // DXB to SIN
      {
        number: 'EK405',
        airline: 'EK',
        from: 'DXB',
        to: 'SIN',
        depTime: new Date(tomorrow.setHours(2, 30, 0)),
        duration: 420,
        aircraft: aircraft[5].id,
        priceEcon: 799,
        priceBus: 2999,
        priceFirst: 7999
      },
      // ORD to MIA
      {
        number: 'AA220',
        airline: 'AA',
        from: 'ORD',
        to: 'MIA',
        depTime: new Date(tomorrow.setHours(9, 15, 0)),
        duration: 195,
        aircraft: aircraft[0].id,
        priceEcon: 199,
        priceBus: 599,
        priceFirst: 1199
      },
      // BOS to LAX
      {
        number: 'UA305',
        airline: 'UA',
        from: 'BOS',
        to: 'LAX',
        depTime: new Date(tomorrow.setHours(7, 30, 0)),
        duration: 390,
        aircraft: aircraft[1].id,
        priceEcon: 319,
        priceBus: 919,
        priceFirst: 1919
      },
      // ATL to SFO
      {
        number: 'DL450',
        airline: 'DL',
        from: 'ATL',
        to: 'SFO',
        depTime: new Date(tomorrow.setHours(12, 0, 0)),
        duration: 300,
        aircraft: aircraft[2].id,
        priceEcon: 339,
        priceBus: 999,
        priceFirst: 2099
      }
    ];

    for (const flight of flights) {
      const arrTime = new Date(flight.depTime);
      arrTime.setMinutes(arrTime.getMinutes() + flight.duration);

      await client.query(
        `INSERT INTO flights (flight_number, airline_code, aircraft_id, departure_airport,
                             arrival_airport, departure_time, arrival_time, duration,
                             base_price_economy, base_price_business, base_price_first,
                             available_seats_economy, available_seats_business, available_seats_first,
                             status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled')`,
        [
          flight.number,
          flight.airline,
          flight.aircraft,
          flight.from,
          flight.to,
          flight.depTime,
          arrTime,
          flight.duration,
          flight.priceEcon,
          flight.priceBus,
          flight.priceFirst,
          150, // Available economy seats
          20,  // Available business seats
          5    // Available first class seats
        ]
      );
    }

    // Get flight IDs to create seats
    console.log('Adding seats for flights...');
    const flightsResult = await client.query('SELECT id, aircraft_id FROM flights');

    for (const flight of flightsResult.rows) {
      const aircraftData = aircraft.find((a: any) => a.id === flight.aircraft_id);

      if (aircraftData) {
        // Generate seat map (simplified)
        const rows = 30;

        // Economy seats (rows 10-30)
        for (let row = 10; row <= rows; row++) {
          for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
            await client.query(
              `INSERT INTO seats (flight_id, seat_number, class, type, is_available, extra_price)
               VALUES ($1, $2, 'economy', 'standard', true, 0)`,
              [flight.id, `${row}${letter}`]
            );
          }
        }

        // Business seats (rows 5-9)
        for (let row = 5; row <= 9; row++) {
          for (const letter of ['A', 'B', 'D', 'E']) {
            await client.query(
              `INSERT INTO seats (flight_id, seat_number, class, type, is_available, extra_price)
               VALUES ($1, $2, 'business', 'standard', true, 0)`,
              [flight.id, `${row}${letter}`]
            );
          }
        }

        // First class seats (rows 1-4)
        for (let row = 1; row <= 4; row++) {
          for (const letter of ['A', 'B']) {
            await client.query(
              `INSERT INTO seats (flight_id, seat_number, class, type, is_available, extra_price)
               VALUES ($1, $2, 'first', 'standard', true, 0)`,
              [flight.id, `${row}${letter}`]
            );
          }
        }
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`
╔════════════════════════════════════════╗
║  Database Seed Summary                 ║
╠════════════════════════════════════════╣
║  Airlines: 10                          ║
║  Airports: 15                          ║
║  Aircraft: 6                           ║
║  Flights: 10                           ║
║  Seats: Generated for all flights      ║
╚════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run seed
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
