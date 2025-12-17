# Railway Persistent Volume Setup for SQLite

## ⚠️ CRITICAL: SQLite Requires Persistent Storage

Railway's default filesystem is **ephemeral** - it gets wiped on every deployment. For SQLite to work, you MUST configure a persistent volume.

## 🔧 Setup Steps

### 1. Go to Railway Dashboard

1. Open https://railway.app/dashboard
2. Click on your project: `razorpayx-payroll-onboarding`
3. Click on your service (backend)

### 2. Add a Volume

1. Click **"Settings"** tab
2. Scroll down to **"Volumes"** section
3. Click **"+ New Volume"**
4. Configure:
   - **Mount Path**: `/app/backend/prisma`
   - **Size**: 1 GB (minimum)
5. Click **"Add"**

### 3. Redeploy

After adding the volume, Railway will automatically redeploy your service.

## ✅ Verification

After the volume is added and deployment completes (~3 minutes), test:

```bash
# Check database health
curl https://laudable-sparkle-production-8104.up.railway.app/health/db

# Should show:
# {"status":"ok","database":"connected","tables":{"businesses":0},...}
```

## 📝 What This Does

- **Without Volume**: Database file is created in ephemeral storage → lost on restart → tables don't exist
- **With Volume**: Database file persists across deployments → data is preserved

## 🚨 If Volume Setup Fails

If Railway doesn't support volumes on your plan, you have two options:

### Option A: Use PostgreSQL Instead
Railway provides free PostgreSQL databases that persist automatically.

### Option B: Deploy to Render
Render supports persistent disks on the free tier:
1. Go to https://render.com
2. Create a new Web Service
3. Add a disk at mount path `/opt/render/project/src/backend/prisma`

See `RENDER_QUICKSTART.md` for detailed Render setup instructions.

## 📚 Railway Documentation

- [Railway Volumes](https://docs.railway.app/reference/volumes)
- [Persistent Storage Guide](https://docs.railway.app/guides/volumes)

