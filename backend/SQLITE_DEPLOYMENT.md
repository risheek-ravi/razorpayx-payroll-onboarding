# SQLite Deployment Options

Since you want to keep SQLite, here are the best deployment alternatives that support persistent file storage.

## ⚠️ Why Not Vercel?

Vercel uses **serverless functions** which are:

- Stateless (no persistent file system)
- Ephemeral (files are deleted after each request)
- Not suitable for SQLite databases

## ✅ Best Alternatives for SQLite

### Option 1: Railway (Recommended) ⭐

**Why Railway?**

- ✅ Persistent file system (perfect for SQLite)
- ✅ Free tier: $5 credit/month
- ✅ Automatic deployments from Git
- ✅ Built-in environment variables
- ✅ Easy to use
- ✅ Supports Node.js + SQLite out of the box

**Pricing:**

- Free: $5 credit/month (enough for small apps)
- Pro: $20/month for more resources

**Deploy Steps:**

1. **Create Account**

   ```bash
   # Go to railway.app
   # Sign up with GitHub
   ```

2. **Deploy from GitHub**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` as root directory

3. **Configure**

   - Railway auto-detects Node.js
   - Add environment variables if needed
   - Deploy!

4. **Access Your API**
   - Railway provides a URL: `https://your-app.railway.app`

**Configuration:**

Create `railway.json` in backend folder:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

### Option 2: Render ⭐

**Why Render?**

- ✅ Persistent disk storage (perfect for SQLite)
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Easy setup
- ✅ Great for Node.js apps

**Pricing:**

- Free: Limited resources, app sleeps after inactivity
- Starter: $7/month for always-on service

**Deploy Steps:**

1. **Create Account**

   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select `backend` directory

3. **Configure**

   ```
   Name: razorpayx-payroll-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

4. **Add Disk Storage**

   - In service settings → "Disks"
   - Add disk: `/app/backend/prisma` (mount path)
   - This persists your SQLite database

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

**Configuration:**

Create `render.yaml` in backend folder:

```yaml
services:
  - type: web
    name: razorpayx-payroll-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    disk:
      name: sqlite-data
      mountPath: /app/backend/prisma
      sizeGB: 1
```

---

### Option 3: Fly.io ⭐

**Why Fly.io?**

- ✅ Persistent volumes for SQLite
- ✅ Free tier: 3 VMs with 256MB RAM
- ✅ Global deployment
- ✅ Docker-based (full control)

**Pricing:**

- Free: 3 shared VMs, 3GB storage
- Pay-as-you-go after free tier

**Deploy Steps:**

1. **Install Fly CLI**

   ```bash
   # macOS
   brew install flyctl

   # Or
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**

   ```bash
   flyctl auth login
   ```

3. **Initialize App**

   ```bash
   cd backend
   flyctl launch

   # Answer prompts:
   # - App name: razorpayx-payroll-backend
   # - Region: Choose closest to you
   # - PostgreSQL: No
   # - Redis: No
   ```

4. **Create Volume for SQLite**

   ```bash
   flyctl volumes create sqlite_data --size 1
   ```

5. **Deploy**
   ```bash
   flyctl deploy
   ```

**Configuration:**

Fly.io creates `fly.toml` automatically:

```toml
app = "razorpayx-payroll-backend"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "3001"

[[services]]
  internal_port = 3001
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[mounts]
  source = "sqlite_data"
  destination = "/app/prisma"
```

---

### Option 4: DigitalOcean App Platform

**Why DigitalOcean?**

- ✅ Persistent storage
- ✅ Simple deployment
- ✅ Reliable infrastructure
- ✅ Good documentation

**Pricing:**

- Basic: $5/month
- Professional: $12/month

**Deploy Steps:**

1. **Create Account**

   - Go to [digitalocean.com](https://digitalocean.com)
   - Sign up

2. **Create App**

   - Apps → "Create App"
   - Connect GitHub repository
   - Select backend folder

3. **Configure**

   ```
   Name: razorpayx-payroll-backend
   Type: Web Service
   Build Command: npm install && npm run build
   Run Command: npm run start
   ```

4. **Add Volume**

   - In app settings
   - Add volume for `/app/prisma`

5. **Deploy**

---

### Option 5: Traditional VPS (Most Control)

**Providers:**

- DigitalOcean Droplets ($4-6/month)
- Linode ($5/month)
- Vultr ($2.50-6/month)
- AWS Lightsail ($3.50-5/month)

**Why VPS?**

- ✅ Full control
- ✅ Persistent storage
- ✅ Can run anything
- ✅ Best for learning

**Deploy Steps:**

1. **Create VPS**

   - Choose Ubuntu 22.04
   - Smallest size is fine ($5/month)

2. **SSH into Server**

   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (Process Manager)**

   ```bash
   npm install -g pm2
   ```

5. **Clone Your Repo**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/backend
   ```

6. **Install Dependencies**

   ```bash
   npm install
   npm run build
   ```

7. **Start with PM2**

   ```bash
   pm2 start dist/index.js --name razorpayx-backend
   pm2 save
   pm2 startup
   ```

8. **Set Up Nginx (Optional)**
   ```bash
   sudo apt install nginx
   # Configure reverse proxy
   ```

---

## 📊 Comparison Table

| Platform         | Free Tier       | SQLite Support | Ease of Use | Best For         |
| ---------------- | --------------- | -------------- | ----------- | ---------------- |
| **Railway**      | $5 credit/month | ✅ Excellent   | ⭐⭐⭐⭐⭐  | Quick deployment |
| **Render**       | Yes (sleeps)    | ✅ Excellent   | ⭐⭐⭐⭐⭐  | Simple apps      |
| **Fly.io**       | 3 VMs free      | ✅ Excellent   | ⭐⭐⭐⭐    | Global apps      |
| **DigitalOcean** | No ($5/month)   | ✅ Good        | ⭐⭐⭐⭐    | Reliable hosting |
| **VPS**          | No ($3-6/month) | ✅ Excellent   | ⭐⭐⭐      | Full control     |

## 🎯 Recommendation

### For Beginners: **Railway** or **Render**

- Easiest to set up
- Great free tiers
- Perfect for SQLite
- Automatic deployments

### For Production: **Fly.io** or **DigitalOcean**

- More reliable
- Better performance
- Global deployment options

### For Learning: **VPS**

- Learn server management
- Full control
- Best value for money

## 🚀 Quick Start with Railway (Fastest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
cd backend
railway init

# 4. Deploy
railway up

# 5. Get URL
railway domain
```

Your API will be live at: `https://your-app.railway.app`

## 🚀 Quick Start with Render (Easiest)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Add Disk:
   - Mount Path: `/app/backend/prisma`
   - Size: 1GB
6. Click "Create Web Service"

Done! Your API will be live in 5 minutes.

## 📱 Frontend Integration

After deployment, update your frontend:

```typescript
// src/config/api.ts
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3001/api/v1',
      android: 'http://10.0.2.2:3001/api/v1',
    })
  : 'https://your-app.railway.app/api/v1'; // or render.com, fly.io, etc.

export {API_BASE_URL};
```

## ⚠️ Important Notes

### Database Backups

SQLite databases should be backed up regularly:

```bash
# On Railway/Render, set up automatic backups
# Or use cron job to copy database file

# Manual backup
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

### Database Location

Make sure your SQLite file is in a persistent volume:

- Railway: Automatically persistent
- Render: Mount disk to `/app/backend/prisma`
- Fly.io: Use volumes
- VPS: Anywhere on disk

### Scaling Considerations

SQLite works great for:

- ✅ Small to medium apps
- ✅ Single-server deployments
- ✅ Read-heavy workloads
- ✅ Up to ~100k rows

Consider PostgreSQL if you need:

- ❌ Multiple servers
- ❌ Very high concurrency
- ❌ Millions of rows
- ❌ Complex queries

## 🆘 Need Help?

### Railway

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

### Render

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)

### Fly.io

- [Fly.io Docs](https://fly.io/docs)
- [Fly.io Community](https://community.fly.io)

## 🎉 Next Steps

1. Choose a platform (Railway or Render recommended)
2. Follow the quick start guide
3. Deploy your backend
4. Update your frontend with the new URL
5. Test everything!

---

**My Recommendation**: Start with **Railway** - it's the easiest and has the best free tier for SQLite apps.
