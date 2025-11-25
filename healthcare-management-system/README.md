# Healthcare Management System

A comprehensive, HIPAA-compliant healthcare management platform built with modern web technologies.

## 🏥 Overview

This is a full-stack healthcare management system designed to streamline patient care, improve operational efficiency, and ensure compliance with healthcare regulations. The system includes:

- **Electronic Health Records (EHR)**
- **Patient Portal**
- **Appointment Scheduling**
- **Billing & Insurance Management**
- **User Management**
- **Real-time Analytics**

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Vite** for build tooling

### Backend
- **NestJS** with TypeScript
- **TypeORM** for database ORM
- **PostgreSQL** for relational data
- **Redis** for caching
- **JWT** for authentication
- **Swagger** for API documentation

### Infrastructure
- **Docker & Docker Compose** for containerization
- **Turborepo** for monorepo management
- **GitHub Actions** for CI/CD (coming soon)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthcare-management-system
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration (optional for development)
```

### 3. Start Docker Services

This will start PostgreSQL, Redis, pgAdmin, and Redis Commander:

```bash
npm run docker:dev
```

**Available Services:**
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050 (admin@healthcare.com / admin)
- **Redis Commander**: http://localhost:8081

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migrations

```bash
# The migrations are automatically applied when PostgreSQL container starts
# Check database/init/01-init.sql and database/migrations/*.sql
```

You can connect to the database using pgAdmin (http://localhost:5050) to verify:
- **Host**: postgres (use 'host.docker.internal' if connecting from host)
- **Database**: healthcare_dev
- **User**: admin
- **Password**: password

### 6. Start Development Servers

```bash
# Start all services (API Gateway + Web App)
npm run dev
```

**OR start services individually:**

```bash
# Terminal 1 - Start API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 2 - Start Web App
cd apps/web
npm install
npm run dev
```

### 7. Access the Application

- **Web Application**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## 🔐 Default Test Credentials

Use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare.com | Password123! |
| Physician | dr.smith@healthcare.com | Password123! |
| Nurse | nurse.jones@healthcare.com | Password123! |
| Receptionist | reception@healthcare.com | Password123! |
| Patient | john.doe@email.com | Password123! |

## 📁 Project Structure

```
healthcare-management-system/
├── apps/
│   ├── web/                      # React web application
│   ├── mobile/                   # React Native app (coming soon)
│   └── admin/                    # Admin dashboard (coming soon)
│
├── services/
│   ├── api-gateway/              # Main API gateway (NestJS)
│   ├── patient-service/          # Patient microservice (coming soon)
│   ├── appointment-service/      # Appointment microservice (coming soon)
│   └── user-service/             # User microservice (coming soon)
│
├── packages/
│   ├── ui/                       # Shared UI components (coming soon)
│   ├── types/                    # Shared TypeScript types (coming soon)
│   └── utils/                    # Shared utilities (coming soon)
│
├── infrastructure/
│   └── docker/
│       ├── docker-compose.dev.yml
│       └── Dockerfile.base
│
├── database/
│   ├── init/                     # Database initialization scripts
│   ├── migrations/               # SQL migration files
│   └── seeds/                    # Seed data
│
├── docs/                         # Documentation
├── package.json                  # Root package.json
└── turbo.json                    # Turborepo configuration
```

## 🎯 Available Features (MVP)

### ✅ Implemented
- [x] User Authentication (JWT)
- [x] User Management
- [x] Patient Registration
- [x] Patient Search
- [x] Dashboard with Statistics
- [x] Role-Based Access Control
- [x] API Documentation (Swagger)
- [x] Docker Development Environment

### 🚧 Coming Soon (Phase 1)
- [ ] Appointment Scheduling
- [ ] Medical Records Management
- [ ] E-Prescribing
- [ ] Billing & Claims
- [ ] Patient Portal
- [ ] Reports & Analytics

## 📚 API Documentation

Once the API Gateway is running, visit:

**Swagger UI**: http://localhost:3000/api/docs

### Key Endpoints

**Authentication**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get current user profile

**Patients**
- `GET /api/v1/patients` - List all patients
- `POST /api/v1/patients` - Create new patient
- `GET /api/v1/patients/:id` - Get patient by ID
- `PATCH /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient

**Users**
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Building for Production

```bash
# Build all packages
npm run build

# Build specific package
cd apps/web
npm run build
```

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:dev

# Stop all services
npm run docker:down

# View logs
docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f

# Rebuild containers
docker-compose -f infrastructure/docker/docker-compose.dev.yml up --build
```

## 📊 Database Management

### Access PostgreSQL via CLI

```bash
docker exec -it hcms-postgres psql -U admin -d healthcare_dev
```

### Common SQL Commands

```sql
-- List all tables
\dt healthcare.*

-- View patients
SELECT * FROM healthcare.patients LIMIT 10;

-- View users
SELECT * FROM healthcare.users;

-- View appointments
SELECT * FROM healthcare.appointments;
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS protection
- Helmet.js security headers
- Rate limiting (coming soon)
- Data encryption at rest (planned)
- Audit logging (planned)

## 🛣️ Roadmap

### Phase 1: MVP (Current)
- Core patient management
- Basic appointment scheduling
- User authentication
- Dashboard

### Phase 2: Enhanced Features
- E-Prescribing
- Lab integration
- Billing & claims
- Patient portal
- Mobile apps

### Phase 3: Advanced Features
- Telemedicine
- AI-powered scheduling
- Advanced analytics
- FHIR API
- HL7 integration

### Phase 4: Enterprise
- Multi-facility support
- Inpatient modules
- Advanced reporting
- SOC 2 compliance
- HIPAA audit tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose -f infrastructure/docker/docker-compose.dev.yml restart postgres

# Check logs
docker logs hcms-postgres
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Clear Node Modules

```bash
# Clean everything
npm run clean

# Reinstall
npm install
```

## 📞 Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation at http://localhost:3000/api/docs

## 🎓 Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)

---

**Built with ❤️ for better healthcare management**
