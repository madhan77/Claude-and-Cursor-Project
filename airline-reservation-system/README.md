# Airline Reservation System

A modern, full-stack airline reservation system built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### Customer Features
- **Flight Search**: Search for flights by origin, destination, date, and passenger count
- **Flight Booking**: Complete booking flow with passenger information
- **User Authentication**: Register and login with JWT-based authentication
- **Booking Management**: View and manage your bookings
- **Booking Cancellation**: Cancel bookings with automatic seat restoration
- **Profile Management**: View and manage user profile

### Technical Features
- **RESTful API**: Well-structured API with proper error handling
- **Database Transactions**: Atomic booking operations
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS
- **Type Safety**: Full TypeScript coverage on both frontend and backend
- **State Management**: Zustand for efficient client-side state management
- **Form Validation**: Client and server-side validation
- **Authentication**: JWT-based auth with access and refresh tokens

## Tech Stack

### Backend
- **Node.js** + **Express.js**: Server framework
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Morgan**: Request logging

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management
- **Axios**: HTTP client
- **React Hot Toast**: Toast notifications
- **date-fns**: Date formatting

## Project Structure

```
airline-reservation-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models (types)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── database/        # Database schema and seed
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd airline-reservation-system
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE airline_reservation;

# Exit psql
\q
```

#### Run Database Schema

```bash
cd backend
psql -U postgres -d airline_reservation -f src/database/schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Update the following variables:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_NAME=airline_reservation
# - DB_USER=postgres
# - DB_PASSWORD=your_password
# - JWT_SECRET=your_secret_key
# - JWT_REFRESH_SECRET=your_refresh_secret
```

#### Seed the Database (Optional but Recommended)

```bash
npm run seed
```

This will populate the database with:
- 10 Airlines
- 15 Airports
- 6 Aircraft types
- 10 Sample flights
- Seat maps for all flights

#### Start Backend Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The backend API will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)
- `POST /api/v1/auth/change-password` - Change password (protected)

### Flights
- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/:id` - Get flight details
- `GET /api/v1/flights/:id/seats` - Get flight seats
- `GET /api/v1/flights/airports` - Get all airports
- `GET /api/v1/flights/airlines` - Get all airlines

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking details
- `GET /api/v1/bookings/my-bookings` - Get user bookings (protected)
- `DELETE /api/v1/bookings/:id` - Cancel booking

## Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=airline_reservation
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Usage

### 1. Browse Flights
- Visit the home page
- Enter departure and arrival airports
- Select dates and number of passengers
- Click "Search Flights"

### 2. Book a Flight
- Select a flight from search results
- Fill in passenger information
- Provide contact details
- Complete booking

### 3. Manage Bookings
- Register or login
- View "My Bookings" to see all bookings
- View booking details or cancel if needed

## Database Schema

### Key Tables:
- **users**: User accounts
- **airlines**: Airline information
- **airports**: Airport information
- **aircraft**: Aircraft types
- **flights**: Flight schedules
- **seats**: Seat inventory
- **bookings**: Booking records
- **passengers**: Passenger information
- **payments**: Payment records
- **notifications**: User notifications

## Default Test Data

After running the seed script, you can test with:

### Sample Routes:
- JFK → LAX (New York to Los Angeles)
- LAX → JFK (Los Angeles to New York)
- JFK → LHR (New York to London)
- SFO → NRT (San Francisco to Tokyo)
- DXB → SIN (Dubai to Singapore)

### Airlines:
- American Airlines (AA)
- United Airlines (UA)
- Delta Air Lines (DL)
- British Airways (BA)
- Emirates (EK)
- And more...

## Development

### Run Backend in Development Mode

```bash
cd backend
npm run dev
```

### Run Frontend in Development Mode

```bash
cd frontend
npm run dev
```

### Build for Production

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## Testing

### Manual Testing
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Test the complete flow:
   - Search for flights
   - Register/Login
   - Make a booking
   - View bookings
   - Cancel a booking

## Common Issues & Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# Find and kill process using port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Find and kill process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

```bash
psql -U postgres -l | grep airline_reservation
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Seat selection with interactive seat map
- [ ] Multi-city flights
- [ ] Round-trip bookings
- [ ] Flight status tracking
- [ ] Check-in functionality
- [ ] Admin dashboard
- [ ] Revenue management
- [ ] Dynamic pricing
- [ ] Loyalty program
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@skybooker.com or open an issue in the repository.

## Acknowledgments

- Built as part of the Airline Reservation PRD implementation
- Inspired by modern booking platforms like Expedia and Booking.com
- UI components styled with Tailwind CSS
- Icons from Heroicons

---

**Happy Flying with SkyBooker! ✈️**
