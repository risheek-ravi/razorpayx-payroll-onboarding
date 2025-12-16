# RazorpayX Payroll Backend

Simple Node.js + Express + Prisma backend with SQLite.

## Setup

```bash
cd backend

# Install dependencies
yarn install

# Generate Prisma client & create database
yarn db:generate
yarn db:push

# Start development server
yarn dev
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Businesses
- `POST /api/v1/businesses` - Create business
- `GET /api/v1/businesses/:id` - Get business by ID
- `GET /api/v1/businesses/latest/one` - Get latest business
- `PATCH /api/v1/businesses/:id/salary-config` - Update salary config

### Employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees` - List employees (optional `?businessId=`)
- `GET /api/v1/employees/:id` - Get employee by ID
- `DELETE /api/v1/employees/:id` - Delete employee

## Database

Uses SQLite (file: `prisma/dev.db`). View data with:

```bash
yarn db:studio
```


