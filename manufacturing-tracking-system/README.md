# Manufacturing Unit Process Tracking System

A comprehensive Manufacturing Execution System (MES) for tracking production orders, work-in-progress, quality inspections, inventory, and equipment across the entire manufacturing lifecycle.

## 🎯 Features

- **Production Order Management** - Create, track, and manage production orders
- **Work-in-Progress (WIP) Tracking** - Real-time job tracking across production stages
- **Quality Management** - Digital inspections, defect logging, and compliance
- **Inventory Management** - Material tracking and consumption monitoring
- **Equipment Management** - Equipment status and maintenance tracking
- **Analytics Dashboard** - Real-time KPIs and production metrics
- **Role-Based Access Control** - Secure authentication with different user roles
- **Mobile-Responsive** - Works on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL (Sequelize ORM)
- Redis (Caching)
- JWT Authentication
- Socket.io (Real-time updates)

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Material-UI (Components)
- Zustand (State management)
- React Query (Data fetching)
- React Router (Navigation)
- Axios (HTTP client)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v7 or higher) - Optional but recommended
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd manufacturing-tracking-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=manufacturing_tracking
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
```

### 3. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE manufacturing_tracking;
\q

# The application will auto-create tables on first run (development mode)
```

### 4. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

Backend will run on `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 👤 Default User Roles

The system supports the following roles:

- **admin** - Full system access
- **manager** - Production management and reporting
- **supervisor** - Shop floor supervision and job tracking
- **operator** - Job execution and data entry
- **quality_inspector** - Quality inspections and approvals
- **inventory_manager** - Inventory and material management
- **maintenance** - Equipment maintenance

## 🔐 First Time Setup

1. **Create Admin User:**

After starting the backend, you can register the first admin user via API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

2. **Login:**

Navigate to `http://localhost:3000` and login with your credentials.

## 📁 Project Structure

```
manufacturing-tracking-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication, validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
└── database/                # SQL scripts, migrations
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Production Orders
- `GET /api/v1/production-orders` - List all orders
- `GET /api/v1/production-orders/:id` - Get order details
- `POST /api/v1/production-orders` - Create new order
- `PUT /api/v1/production-orders/:id` - Update order
- `DELETE /api/v1/production-orders/:id` - Delete order
- `GET /api/v1/production-orders/stats` - Dashboard statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reloads on file changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement (HMR)
```

## 📦 Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the 'dist' folder with your preferred web server
```

## 🐳 Docker Deployment (Coming Soon)

```bash
docker-compose up -d
```

## 🛠️ Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manufacturing_tracking
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database Schema

The application uses the following main entities:

- **Users** - System users with role-based access
- **Products** - Finished goods that are manufactured
- **Production Orders** - Orders to manufacture products
- **Jobs** - Work-in-progress batches
- **Quality Inspections** - Quality checkpoints and results
- **Materials** - Raw materials and components
- **Equipment** - Manufacturing equipment and machinery

See the [PRD document](../MANUFACTURING_UNIT_PRD.md) for detailed data models.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🗺️ Roadmap

- [x] Core production order management
- [x] Authentication and authorization
- [x] Basic dashboard and analytics
- [ ] Complete WIP tracking module
- [ ] Quality management module
- [ ] Inventory management module
- [ ] Equipment maintenance module
- [ ] Real-time WebSocket updates
- [ ] Mobile app (React Native)
- [ ] Barcode/QR code scanning
- [ ] Advanced analytics and reporting
- [ ] AI-powered predictive maintenance
- [ ] IoT device integration

## 🙏 Acknowledgments

Built with modern web technologies and industry best practices for manufacturing execution systems.

---

**Version:** 1.0.0
**Last Updated:** November 2025
