import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes (will create these next)
import authRoutes from './routes/auth.routes';
import flightRoutes from './routes/flight.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import promoRoutes from './routes/promo.routes';
import ancillaryRoutes from './routes/ancillary.routes';
import seatRoutes from './routes/seat.routes';
import checkinRoutes from './routes/checkin.routes';
import loyaltyRoutes from './routes/loyalty.routes';

// Import auto-migration and auto-seed
import { runAutoMigration } from './database/autoMigrate';
import { runAutoSeed } from './database/autoSeed';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
    ];

    // In production, also allow any *.onrender.com domain
    if (process.env.NODE_ENV === 'production' && origin.includes('.onrender.com')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});

app.use(`/api/${API_VERSION}`, limiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Airline Reservation API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/flights`, flightRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/promo`, promoRoutes);
app.use(`/api/${API_VERSION}/ancillary`, ancillaryRoutes);
app.use(`/api/${API_VERSION}/seats`, seatRoutes);
app.use(`/api/${API_VERSION}/checkin`, checkinRoutes);
app.use(`/api/${API_VERSION}/loyalty`, loyaltyRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with auto-migration
const startServer = async () => {
  try {
    // Run auto-migration before starting server
    console.log('🚀 Starting Airline Reservation System...\n');

    // Try to run migrations, but don't fail if database isn't available yet
    try {
      await runAutoMigration();
      // After migrations, try to auto-seed if enabled
      await runAutoSeed();
    } catch (migrationError) {
      console.warn('⚠️  Migrations skipped - database may not be configured yet');
    }

    console.log(''); // Empty line for formatting

    // Start the server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🛫 Airline Reservation System API                   ║
║                                                        ║
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   API Version: ${API_VERSION}                                  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);

      if (!process.env.DATABASE_URL) {
        console.warn('\n⚠️  WARNING: DATABASE_URL not set!');
        console.warn('API endpoints requiring database access will fail.');
        console.warn('Please configure DATABASE_URL in Render environment variables.\n');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

export default app;
