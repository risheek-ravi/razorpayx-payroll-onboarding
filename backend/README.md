# RazorpayX Payroll Backend API

Express + Prisma backend with SQLite for RazorpayX Payroll Onboarding

## Quick Start

### Local Development

```bash
cd backend

# Install dependencies
yarn install

# Generate Prisma client
yarn db:generate

# Push schema to database
yarn db:push

# Start development server
yarn dev
```

The server will start at `http://localhost:3001`

## 🚀 Deployment

**Your backend uses SQLite and needs a platform with persistent storage.**

### Recommended Platforms:

1. **Railway** (Easiest) - [`RAILWAY_QUICKSTART.md`](./RAILWAY_QUICKSTART.md)
2. **Render** (Free tier) - [`RENDER_QUICKSTART.md`](./RENDER_QUICKSTART.md)
3. **Other options** - [`SQLITE_DEPLOYMENT.md`](./SQLITE_DEPLOYMENT.md)

**Start here**: [`START_HERE.md`](./START_HERE.md)

### Quick Deploy to Railway

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
railway domain
```

### Quick Deploy to Render

1. Go to [render.com](https://render.com)
2. New + → Web Service → Connect GitHub
3. Root Directory: `backend`
4. Add Disk: `/opt/render/project/src/backend/prisma` (1GB)
5. Deploy!

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

### Shifts
- `POST /api/v1/shifts` - Create shift
- `GET /api/v1/shifts` - List all shifts
- `GET /api/v1/shifts/:id` - Get shift by ID
- `PUT /api/v1/shifts/:id` - Update shift
- `DELETE /api/v1/shifts/:id` - Delete shift

## Database

This project uses **Prisma ORM** with **SQLite**.

### Database Commands

```bash
# Generate Prisma client
yarn db:generate

# Push schema changes
yarn db:push

# Create migration
yarn db:migrate

# Open Prisma Studio (database GUI)
yarn db:studio
```

### Database Location

- **Local**: `backend/prisma/dev.db`
- **Railway**: Automatically persistent
- **Render**: Persistent disk at mount path
- **Other platforms**: Check platform docs

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Validation**: Zod
- **Language**: TypeScript
- **Deployment**: Railway, Render, Fly.io, etc.

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main application entry
│   ├── routes/               # API route handlers
│   │   ├── business.ts
│   │   ├── employee.ts
│   │   └── shift.ts
│   ├── middleware/           # Express middleware
│   │   └── errorHandler.ts
│   └── lib/                  # Utilities
│       └── prisma.ts         # Prisma client instance
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database file
├── railway.json              # Railway config
├── render.yaml               # Render config
├── Dockerfile                # Docker config
├── START_HERE.md             # Deployment guide
└── package.json
```

## Development Scripts

```bash
# Start dev server with hot reload
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Generate Prisma client
yarn db:generate

# Push schema changes
yarn db:push

# Create migration
yarn db:migrate

# Open database GUI
yarn db:studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |

## Deployment Documentation

- **Start Here**: [`START_HERE.md`](./START_HERE.md) - Choose your deployment path
- **Railway**: [`RAILWAY_QUICKSTART.md`](./RAILWAY_QUICKSTART.md) - 5-minute Railway guide
- **Render**: [`RENDER_QUICKSTART.md`](./RENDER_QUICKSTART.md) - 5-minute Render guide
- **All Options**: [`SQLITE_DEPLOYMENT.md`](./SQLITE_DEPLOYMENT.md) - Complete deployment guide
- **Frontend**: [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md) - Connect your app

## SQLite Considerations

### When SQLite Works Great
- ✅ Small to medium apps
- ✅ Single-server deployments
- ✅ Up to ~100k rows
- ✅ Read-heavy workloads
- ✅ Development and testing

### When to Consider PostgreSQL
- ❌ Multiple servers needed
- ❌ Very high concurrency
- ❌ Millions of rows
- ❌ Complex distributed systems

## Database Backups

**Important**: Always backup your SQLite database!

```bash
# Local backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# On deployed platform (Railway/Render)
# Use platform's shell to create backups
```

## Testing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API endpoints
curl -X POST http://localhost:3001/api/v1/businesses \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","businessName":"Test Co","businessEmail":"test@example.com"}'
```

## Troubleshooting

### "Prisma Client not found"
```bash
yarn db:generate
```

### "Database file not found"
```bash
yarn db:push
```

### "Port already in use"
```bash
# Change PORT in .env or kill the process
lsof -ti:3001 | xargs kill
```

### "Build failed on deployment"
- Check platform logs
- Verify `package.json` scripts
- Ensure all dependencies are listed

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - RazorpayX

---

**Ready to deploy?** Start with [`START_HERE.md`](./START_HERE.md) 🚀
