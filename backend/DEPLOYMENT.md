# Backend Deployment Guide - Vercel

This guide will help you deploy the RazorpayX Payroll backend to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
3. A PostgreSQL database (recommended options below)

## Step 1: Set Up PostgreSQL Database

Since Vercel uses serverless functions, SQLite won't work in production. Choose one of these options:

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` connection string

### Option B: Supabase (Free tier available)

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the connection string (use the "Connection pooling" URL for better performance)

### Option C: Neon (Free tier available)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Step 2: Create Initial Migration

Before deploying, create a migration for your database schema:

```bash
cd backend

# Create .env file with your PostgreSQL DATABASE_URL
echo 'DATABASE_URL="postgresql://user:password@host:5432/dbname"' > .env

# Create initial migration
npx prisma migrate dev --name init

# This will create a migrations folder with your schema
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

```bash
cd backend

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (accept default or customize)
# - Directory? ./ (current directory)
# - Override settings? No

# Add environment variable
vercel env add DATABASE_URL

# Paste your PostgreSQL connection string when prompted
# Select: Production, Preview, and Development

# Deploy to production
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set the **Root Directory** to `backend`
4. Add Environment Variables:
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
5. Click **Deploy**

## Step 4: Verify Deployment

After deployment, you'll get a URL like: `https://your-project.vercel.app`

Test the health endpoint:

```bash
curl https://your-project.vercel.app/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 5: Update Frontend to Use Production URL

Update your React Native app to use the production URL:

```typescript
// In your frontend code
const API_URL = __DEV__
  ? 'http://10.0.2.2:3001/api/v1' // Local development
  : 'https://your-project.vercel.app/api/v1'; // Production
```

## Environment Variables

Make sure these are set in Vercel:

| Variable       | Description                  | Example                               |
| -------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV`     | Environment                  | `production` (auto-set by Vercel)     |

## Troubleshooting

### Issue: Prisma Client not generated

**Solution**: Vercel automatically runs `vercel-build` script which includes `prisma generate`

### Issue: Database connection errors

**Solution**:

- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Ensure your database allows connections from Vercel's IP ranges
- For Supabase/Neon, use the connection pooling URL

### Issue: Cold starts are slow

**Solution**:

- This is normal for serverless functions
- Consider upgrading to Vercel Pro for better performance
- Use connection pooling (Prisma Data Proxy or PgBouncer)

### Issue: API routes not working

**Solution**:

- Check Vercel deployment logs
- Ensure `vercel.json` is in the backend directory
- Verify all routes start with `/api/v1`

## Local Development

For local development, you can still use SQLite:

```bash
# Create a .env.local file
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# Update prisma/schema.prisma temporarily for local dev:
# provider = "sqlite"

# Generate and push schema
npm run db:generate
npm run db:push

# Start dev server
npm run dev
```

## Useful Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel remove [deployment-url]

# Open project in browser
vercel open

# Pull environment variables
vercel env pull
```

## Production Checklist

- [ ] PostgreSQL database set up and accessible
- [ ] `DATABASE_URL` environment variable configured in Vercel
- [ ] Initial migration created and deployed
- [ ] Health endpoint responding
- [ ] All API routes tested
- [ ] Frontend updated with production URL
- [ ] CORS configured correctly (if needed for web)
- [ ] Error monitoring set up (optional: Sentry, LogRocket)

## Next Steps

1. **Set up monitoring**: Consider adding error tracking with Sentry
2. **Add rate limiting**: Protect your API from abuse
3. **Set up CI/CD**: Auto-deploy on git push
4. **Add API documentation**: Consider Swagger/OpenAPI
5. **Implement caching**: Use Redis for better performance

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
