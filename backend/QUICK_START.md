# 🚀 Quick Start: Deploy to Vercel in 5 Minutes

The fastest way to get your backend live on Vercel.

## Prerequisites

- Node.js installed
- A Vercel account (free)
- 5 minutes of your time

## Step-by-Step

### 1️⃣ Install Vercel CLI (30 seconds)

```bash
npm install -g vercel
```

### 2️⃣ Get a PostgreSQL Database (2 minutes)

**Easiest option - Vercel Postgres:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the `DATABASE_URL` connection string
4. Save it somewhere safe

**Alternative - Supabase (free):**

1. Go to [supabase.com](https://supabase.com)
2. Create a project
3. Go to Settings → Database → Connection String
4. Copy the connection pooling URL

### 3️⃣ Deploy (1 minute)

```bash
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** (select your account)
- **Link to existing project?** No
- **Project name?** (press Enter or customize)
- **Directory?** ./ (press Enter)
- **Override settings?** No

### 4️⃣ Add Database URL (1 minute)

```bash
# Add DATABASE_URL to Vercel
vercel env add DATABASE_URL

# Paste your PostgreSQL connection string when prompted
# Select: Production, Preview, Development (all three)
```

### 5️⃣ Redeploy with Database (30 seconds)

```bash
vercel --prod
```

### 6️⃣ Test It! (30 seconds)

```bash
# Replace YOUR-PROJECT with your actual Vercel URL
curl https://YOUR-PROJECT.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## ✅ Done!

Your backend is now live at: `https://YOUR-PROJECT.vercel.app`

## 📱 Connect Your Frontend

Update your React Native app:

```typescript
// src/config/api.ts
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3001/api/v1'  // Android emulator
  : 'https://YOUR-PROJECT.vercel.app/api/v1';  // Production

export { API_BASE_URL };
```

## 🎯 Your API Endpoints

- Health: `https://YOUR-PROJECT.vercel.app/health`
- Businesses: `https://YOUR-PROJECT.vercel.app/api/v1/businesses`
- Employees: `https://YOUR-PROJECT.vercel.app/api/v1/employees`
- Shifts: `https://YOUR-PROJECT.vercel.app/api/v1/shifts`

## 🆘 Something Went Wrong?

### "Command not found: vercel"
```bash
# Install globally
npm install -g vercel

# Or use npx
npx vercel --prod
```

### "Database connection failed"
```bash
# Check if DATABASE_URL is set
vercel env ls

# If not, add it
vercel env add DATABASE_URL
```

### "Build failed"
```bash
# Check logs
vercel logs

# Common fix: redeploy
vercel --prod
```

## 📚 Want More Details?

- **Full deployment guide**: See `DEPLOYMENT.md`
- **Frontend integration**: See `FRONTEND_INTEGRATION.md`
- **Database migration**: See `MIGRATION_GUIDE.md`
- **Complete summary**: See `VERCEL_SETUP_SUMMARY.md`

## 🎉 What's Next?

1. ✅ Test all your API endpoints
2. ✅ Update your mobile app with the production URL
3. ✅ Test the full app end-to-end
4. ✅ Share your app with users!

---

**Need help?** Check the other documentation files or Vercel's support.

