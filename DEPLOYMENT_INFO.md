# 🚀 Deployment Information

## Backend Deployment

### Platform: Railway
- **Status**: ✅ Deployed
- **URL**: https://laudable-sparkle-production-8104.up.railway.app
- **API Base**: https://laudable-sparkle-production-8104.up.railway.app/api/v1
- **Health Check**: https://laudable-sparkle-production-8104.up.railway.app/health

### Database
- **Type**: SQLite
- **Location**: Persistent on Railway file system
- **Path**: `backend/prisma/dev.db`

## API Endpoints

### Health Check
```bash
curl https://laudable-sparkle-production-8104.up.railway.app/health
```

### Businesses
- `POST /api/v1/businesses` - Create business
- `GET /api/v1/businesses/:id` - Get business by ID
- `GET /api/v1/businesses/latest/one` - Get latest business
- `PATCH /api/v1/businesses/:id/salary-config` - Update salary config

### Employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees?businessId={id}` - List employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `PATCH /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Shifts
- `POST /api/v1/shifts` - Create shift
- `GET /api/v1/shifts` - List all shifts
- `GET /api/v1/shifts/:id` - Get shift by ID
- `PATCH /api/v1/shifts/:id` - Update shift
- `DELETE /api/v1/shifts/:id` - Delete shift
- `POST /api/v1/shifts/:id/assign` - Assign shift to employees
- `PATCH /api/v1/shifts/:id/assign` - Update shift assignment

## Frontend Configuration

### API Configuration File
Location: `src/config/api.ts`

The app automatically switches between development and production URLs:

**Development Mode** (`__DEV__ = true`):
- iOS Simulator: `http://localhost:3001/api/v1`
- Android Emulator: `http://10.0.2.2:3001/api/v1`

**Production Mode** (`__DEV__ = false`):
- Railway: `https://laudable-sparkle-production-8104.up.railway.app/api/v1`

### Testing Connection

You can test the backend connection using:

```typescript
import {testApiConnection} from './src/config/api';

// Test connection
const isConnected = await testApiConnection();
console.log('Backend connected:', isConnected);
```

## Deployment Details

### Deployed On
- Date: December 17, 2025
- Platform: Railway
- Region: Auto-selected by Railway

### Build Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Node Version**: 20.x
- **Port**: Auto-assigned by Railway (via `process.env.PORT`)

### Environment Variables
- `PORT`: Auto-set by Railway
- `NODE_ENV`: `production`

## Monitoring & Logs

### View Logs
```bash
# Using Railway CLI
railway logs

# Or view in Railway dashboard
# https://railway.app/dashboard
```

### Health Monitoring
The `/health` endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T15:02:00.519Z"
}
```

## Automatic Deployments

Railway is configured for automatic deployments:
- Push to GitHub → Railway auto-deploys
- No manual deployment needed
- View deployment status in Railway dashboard

## Database Backups

### Manual Backup
```bash
# Using Railway CLI
railway run cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

### Recommended Backup Schedule
- Daily backups for production
- Keep last 7 days of backups
- Store backups in secure location

## Troubleshooting

### Backend Not Responding
1. Check Railway dashboard for service status
2. View logs: `railway logs`
3. Verify health endpoint: `curl https://laudable-sparkle-production-8104.up.railway.app/health`

### Frontend Can't Connect
1. Check if using correct URL in production build
2. Verify `__DEV__` is false in production
3. Check network connectivity
4. View console logs for API errors

### Database Issues
1. Check Railway logs for Prisma errors
2. Verify database file exists: `railway run ls -la prisma/`
3. Run migrations if needed: `railway run npx prisma db push`

## Useful Commands

### Railway CLI
```bash
# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Check service status
railway status
```

### Testing Endpoints
```bash
# Health check
curl https://laudable-sparkle-production-8104.up.railway.app/health

# Create business
curl -X POST https://laudable-sparkle-production-8104.up.railway.app/api/v1/businesses \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","businessName":"Test Co","businessEmail":"test@example.com"}'

# List employees
curl https://laudable-sparkle-production-8104.up.railway.app/api/v1/employees
```

## Next Steps

1. ✅ Backend deployed successfully
2. ✅ Frontend configured with production URL
3. ⏳ Test all features in production
4. ⏳ Set up monitoring/alerts
5. ⏳ Configure automatic backups
6. ⏳ Share with users

## Support

### Railway
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Backend Documentation
- See `backend/README.md` for API details
- See `backend/RAILWAY_QUICKSTART.md` for deployment guide

---

**Last Updated**: December 17, 2025
**Status**: ✅ Production Ready

