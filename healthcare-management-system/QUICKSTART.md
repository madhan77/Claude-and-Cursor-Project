# Quick Start Guide

Get the Healthcare Management System running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18+
docker --version
docker-compose --version
```

## Installation Steps

### 1. Start Database Services

```bash
cd healthcare-management-system
npm run docker:dev
```

Wait for services to start (about 30 seconds). You should see:
- ✅ PostgreSQL running on port 5432
- ✅ Redis running on port 6379
- ✅ pgAdmin running on port 5050
- ✅ Redis Commander on port 8081

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

```bash
# Option 1: Start everything at once
npm run dev

# Option 2: Start services separately
cd services/api-gateway && npm install && npm run dev &
cd apps/web && npm install && npm run dev
```

### 4. Access the Application

Open your browser:
- **Web App**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs

### 5. Login

Use these credentials:
- **Email**: admin@healthcare.com
- **Password**: Password123!

## What's Included

After login, you can:
- ✅ View Dashboard with statistics
- ✅ Browse all patients
- ✅ Search patients by name, email, or MRN
- ✅ View all users and their roles
- ✅ Access API documentation

## Test the API

### Using Swagger UI
1. Go to http://localhost:3000/api/docs
2. Click "Authorize" button
3. Login to get a token
4. Try the endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"Password123!"}'

# Get patients (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Verify Database

**Using pgAdmin** (http://localhost:5050):
1. Login: admin@healthcare.com / admin
2. Add New Server:
   - Name: Healthcare Dev
   - Host: postgres
   - Port: 5432
   - Database: healthcare_dev
   - Username: admin
   - Password: password

**Using CLI**:
```bash
docker exec -it hcms-postgres psql -U admin -d healthcare_dev

-- View test data
SELECT * FROM healthcare.users;
SELECT * FROM healthcare.patients;
```

## Stop Services

```bash
# Stop application servers
Ctrl+C

# Stop Docker services
npm run docker:down
```

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### "Cannot connect to database"
```bash
# Restart Docker services
npm run docker:down
npm run docker:dev
```

### "Module not found"
```bash
# Clean install
rm -rf node_modules
npm install
```

## Next Steps

- Read the full [README.md](./README.md)
- Explore [API Documentation](http://localhost:3000/api/docs)
- Check [Implementation Roadmap](../HEALTHCARE_IMPLEMENTATION_ROADMAP.md)
- Review [PRD](../HEALTHCARE_MANAGEMENT_PRD.md)

## Default Test Data

**Users**: 10 test users (admin, doctors, nurses, receptionists, patients)
**Patients**: 5 sample patients with complete demographics

All default passwords: `Password123!`

---

🎉 **You're all set! Happy coding!**
