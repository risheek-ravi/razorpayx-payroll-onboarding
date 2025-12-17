# 🎨 Render Deployment - Quick Start (5 Minutes)

Deploy your SQLite backend to Render in 5 minutes!

## Why Render?

- ✅ **Persistent disk storage** - Perfect for SQLite
- ✅ **Free tier available** - Great for testing
- ✅ **Automatic deployments** - Push to Git, auto-deploy
- ✅ **Simple configuration** - Easy to set up
- ✅ **Reliable** - Great uptime and performance

## Prerequisites

- GitHub account
- Your code pushed to GitHub

## Quick Deploy (5 Minutes)

### Step 1: Create Render Account (1 minute)

1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render

### Step 2: Create Web Service (1 minute)

1. Click "New +" → "Web Service"
2. Click "Connect account" (if first time)
3. Find your repository
4. Click "Connect"

### Step 3: Configure Service (2 minutes)

Fill in the configuration:

**Basic Settings:**
- **Name**: `razorpayx-payroll-backend`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run db:generate && npm run build
  ```
- **Start Command**: 
  ```bash
  npm run start
  ```

**Instance Type:**
- Select **Free** (or Starter if you need always-on)

### Step 4: Add Persistent Disk (1 minute) ⚠️ IMPORTANT

This is crucial for SQLite!

1. Scroll down to "Disk"
2. Click "Add Disk"
3. Configure:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src/backend/prisma`
   - **Size**: `1 GB` (free tier)

### Step 5: Create Web Service (30 seconds)

1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Watch the logs for any errors

### Step 6: Get Your URL (30 seconds)

After deployment completes:
1. Your URL is shown at the top: `https://your-app.onrender.com`
2. Copy this URL

### Step 7: Test It! (30 seconds)

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Your API is Live!

Your backend is now accessible at:
- **Base URL**: `https://your-app.onrender.com`
- **Health**: `https://your-app.onrender.com/health`
- **API**: `https://your-app.onrender.com/api/v1`

## 📱 Update Your Frontend

```typescript
// src/config/api.ts
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3001/api/v1',
      android: 'http://10.0.2.2:3001/api/v1',
    })
  : 'https://your-app.onrender.com/api/v1';

export { API_BASE_URL };
```

## 🔄 Automatic Deployments

Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render detects the push and deploys automatically! 🎉

## ⚠️ Free Tier Important Notes

### App Sleep Behavior
- **Free tier apps sleep after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds to wake up
- Subsequent requests are fast

### Keep App Awake (Optional)
Use a service like [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes:
- Add monitor: `https://your-app.onrender.com/health`
- Interval: 5 minutes
- This keeps your app awake

### Upgrade to Starter ($7/month)
- Always-on (no sleep)
- Faster response times
- Better for production

## 📊 Monitor Your App

### View Logs

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. View real-time logs

### View Metrics

1. Click "Metrics" tab
2. View:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Set Up Alerts

1. Go to "Settings"
2. Scroll to "Notifications"
3. Add email for alerts

## ⚙️ Environment Variables (Optional)

If you need environment variables:

1. Go to your service
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Add key-value pairs
5. Click "Save Changes"

## 🗄️ Disk Management

### Verify Disk is Mounted

Check logs for:
```
Disk mounted at /opt/render/project/src/backend/prisma
```

### Disk Persistence

- ✅ Data persists across deployments
- ✅ Survives app restarts
- ✅ 1GB free tier (enough for most apps)

### Access Disk via Shell

1. Go to your service
2. Click "Shell" tab
3. Run commands:
   ```bash
   ls -la /opt/render/project/src/backend/prisma
   ```

## 🔧 Troubleshooting

### Build Failed

**Check build logs:**
1. Go to "Events" tab
2. Click failed deployment
3. Review build logs

**Common fixes:**
- Verify `package.json` scripts are correct
- Check Node.js version compatibility
- Ensure all dependencies are listed

### App Not Starting

**Check start command:**
1. Go to "Settings"
2. Verify Start Command: `npm run start`
3. Check if build completed successfully

### Database Not Found

**Verify disk mount path:**
1. Go to "Disks" in settings
2. Check mount path matches your schema
3. Should be: `/opt/render/project/src/backend/prisma`

**Update schema if needed:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Port Issues

Render sets `PORT` environment variable automatically.
Your app should use:
```typescript
const PORT = Number(process.env.PORT) || 3001;
```

### First Request is Slow (Free Tier)

This is expected! Free tier apps sleep after 15 minutes.
- First request: 30-60 seconds
- Subsequent requests: Fast

**Solutions:**
- Upgrade to Starter plan ($7/month)
- Use UptimeRobot to keep app awake
- Accept the trade-off for free hosting

## 🚀 Advanced Features

### Custom Domain

1. Go to "Settings"
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Follow DNS configuration steps

### Deploy Hooks

Create webhook for manual deployments:
1. Go to "Settings"
2. Scroll to "Deploy Hook"
3. Copy webhook URL
4. Trigger with:
   ```bash
   curl -X POST https://api.render.com/deploy/srv-xxx
   ```

### Preview Environments

Render creates preview environments for pull requests:
1. Enable in "Settings" → "Pull Request Previews"
2. Each PR gets a unique URL
3. Great for testing before merging

### Database Backups

**Manual backup:**
1. Go to "Shell" tab
2. Run:
   ```bash
   cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
   ```

**Download backup:**
1. Use Shell to create backup
2. Use `scp` or Render's file browser (if available)

## 📚 Useful Features

### Health Checks

Render automatically monitors your `/health` endpoint:
1. Go to "Settings"
2. Scroll to "Health Check Path"
3. Set to: `/health`

### Auto-Deploy

Control when to deploy:
1. Go to "Settings"
2. Toggle "Auto-Deploy"
3. If off, deploy manually from dashboard

### Rollback

Rollback to previous deployment:
1. Go to "Events" tab
2. Find successful deployment
3. Click "Rollback to this version"

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created
- [ ] Root directory set to `backend`
- [ ] Build and start commands configured
- [ ] **Disk added for SQLite** ⚠️ CRITICAL
- [ ] Service deployed successfully
- [ ] Health endpoint tested
- [ ] API endpoints tested
- [ ] Frontend updated with production URL

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for 1 app)
- ✅ 1GB persistent disk
- ⚠️ Apps sleep after 15 minutes
- ⚠️ Slower cold starts

### Starter ($7/month)
- ✅ Always-on (no sleep)
- ✅ Faster performance
- ✅ 1GB persistent disk included
- ✅ Better for production

### Standard ($25/month)
- ✅ More resources
- ✅ 10GB persistent disk
- ✅ Best for high-traffic apps

## 🎉 You're Done!

Your SQLite backend is now live on Render!

### Next Steps

1. ✅ Test all API endpoints
2. ✅ Update mobile app with production URL
3. ✅ Monitor logs for any errors
4. ✅ Consider upgrading to Starter for production
5. ✅ Set up health check monitoring
6. ✅ Share with users!

## 🆘 Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Community**: [community.render.com](https://community.render.com)
- **Render Status**: [status.render.com](https://status.render.com)
- **Support**: Email support@render.com

## 💡 Pro Tips

1. **Use render.yaml** for infrastructure as code
2. **Enable health checks** for automatic monitoring
3. **Set up notifications** for deployment failures
4. **Use preview environments** for testing PRs
5. **Monitor disk usage** to avoid running out of space
6. **Upgrade to Starter** for production apps

---

**Deployed successfully?** Update your frontend and start testing! 🚀

