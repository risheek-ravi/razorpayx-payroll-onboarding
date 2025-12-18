# 🚂 Railway Deployment - Quick Start (5 Minutes)

Deploy your SQLite backend to Railway in 5 minutes!

## Why Railway?

- ✅ **Persistent file system** - Perfect for SQLite
- ✅ **$5 free credit/month** - Enough for small apps
- ✅ **Automatic deployments** - Push to Git, auto-deploy
- ✅ **Zero configuration** - Works out of the box
- ✅ **Easy to use** - Simplest deployment platform

## Prerequisites

- GitHub account
- Your code pushed to GitHub

## Method 1: Deploy via Railway Dashboard (Easiest)

### Step 1: Create Railway Account (1 minute)

1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway

### Step 2: Create New Project (30 seconds)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will scan and detect Node.js

### Step 3: Configure Root Directory (30 seconds)

1. Click on your service
2. Go to "Settings"
3. Under "Root Directory", enter: `backend`
4. Click "Save"

### Step 4: Deploy! (2 minutes)

Railway automatically:

- ✅ Installs dependencies
- ✅ Builds your app
- ✅ Starts the server
- ✅ Generates a public URL

### Step 5: Get Your URL (30 seconds)

1. Click on your service
2. Go to "Settings" → "Networking"
3. Click "Generate Domain"
4. Copy your URL: `https://your-app.railway.app`

### Step 6: Test It! (30 seconds)

```bash
curl https://your-app.railway.app/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Method 2: Deploy via Railway CLI (For Developers)

### Step 1: Install Railway CLI

```bash
# macOS/Linux
npm install -g @railway/cli

# Or using Homebrew
brew install railway
```

### Step 2: Login

```bash
railway login
```

This opens your browser to authenticate.

### Step 3: Initialize Project

```bash
cd backend
railway init
```

Follow prompts:

- Create new project? **Yes**
- Project name: **razorpayx-payroll-backend**

### Step 4: Link and Deploy

```bash
# Link to Railway
railway link

# Deploy
railway up
```

### Step 5: Generate Domain

```bash
railway domain
```

### Step 6: Open in Browser

```bash
railway open
```

## 🎯 Your API is Live!

Your backend is now accessible at:

- **Base URL**: `https://your-app.railway.app`
- **Health**: `https://your-app.railway.app/health`
- **API**: `https://your-app.railway.app/api/v1`

## 📱 Update Your Frontend

```typescript
// src/config/api.ts
import {Platform} from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3001/api/v1',
      android: 'http://10.0.2.2:3001/api/v1',
    })
  : 'https://your-app.railway.app/api/v1';

export {API_BASE_URL};
```

## 🔄 Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway detects the push and deploys automatically! 🎉

## 📊 Monitor Your App

### View Logs

**Dashboard:**

1. Go to Railway dashboard
2. Click your service
3. Click "Deployments" → View logs

**CLI:**

```bash
railway logs
```

### View Metrics

1. Go to Railway dashboard
2. Click your service
3. View CPU, Memory, Network usage

## 💰 Pricing & Usage

### Free Tier

- **$5 credit/month**
- Enough for ~500 hours of runtime
- Perfect for development and small apps

### Usage Tips

```bash
# Check usage
railway status

# View billing
railway open
# Go to Account → Usage
```

## ⚙️ Environment Variables (Optional)

If you need environment variables:

**Dashboard:**

1. Click your service
2. Go to "Variables"
3. Add variables

**CLI:**

```bash
railway variables set KEY=value
```

## 🗄️ Database Persistence

Railway automatically provides persistent storage:

- ✅ Your SQLite database persists across deployments
- ✅ Located at: `backend/prisma/dev.db`
- ✅ Survives restarts and redeployments

## 🔧 Troubleshooting

### Build Failed

**Check logs:**

```bash
railway logs
```

**Common fixes:**

- Ensure `package.json` has correct scripts
- Verify `railway.json` is in backend folder
- Check Node.js version compatibility

### App Not Starting

**Check start command:**

1. Go to Settings → Deploy
2. Verify start command: `npm run start`
3. Ensure build command ran successfully

### Database Not Persisting

**Verify file location:**

- SQLite file should be in project directory
- Railway persists the entire project folder
- Check `prisma/schema.prisma` path is correct

### Port Issues

Railway automatically sets `PORT` environment variable.
Your app should use:

```typescript
const PORT = Number(process.env.PORT) || 3001;
```

## 🚀 Advanced Features

### Custom Domain

1. Go to Settings → Networking
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records

### Multiple Environments

```bash
# Create staging environment
railway environment create staging

# Switch environments
railway environment use staging

# Deploy to staging
railway up
```

### Database Backups

```bash
# Download database
railway run cat prisma/dev.db > backup.db

# Or use Railway's built-in backups
# Dashboard → Service → Backups
```

## 📚 Useful Commands

```bash
# View service status
railway status

# View logs (live)
railway logs

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# List all projects
railway list

# Unlink project
railway unlink

# Delete service
railway down
```

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Project created and linked
- [ ] Root directory set to `backend`
- [ ] Domain generated
- [ ] Health endpoint tested
- [ ] API endpoints tested
- [ ] Frontend updated with production URL
- [ ] App tested end-to-end

## 🎉 You're Done!

Your SQLite backend is now live on Railway!

### Next Steps

1. ✅ Test all API endpoints
2. ✅ Update mobile app with production URL
3. ✅ Monitor logs for any errors
4. ✅ Set up automatic backups (optional)
5. ✅ Share with users!

## 🆘 Need Help?

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Status**: [status.railway.app](https://status.railway.app)

## 💡 Pro Tips

1. **Use Railway CLI** for faster deployments
2. **Enable GitHub integration** for auto-deploy
3. **Monitor usage** to stay within free tier
4. **Set up alerts** for downtime
5. **Use environment variables** for configuration

---

**Deployed successfully?** Update your frontend and start testing! 🚀
