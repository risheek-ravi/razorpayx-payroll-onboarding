# 🔄 Switch from Railway to Render

## Why Switch?

Railway is having persistent OpenSSL/Prisma compatibility issues with SQLite. **Render works perfectly with SQLite** and is actually simpler to set up.

## ✅ Quick Deploy to Render (5 Minutes)

### Step 1: Create Render Account (1 minute)
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render

### Step 2: Create Web Service (2 minutes)
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repo: `razorpayx-payroll-onboarding`
4. Configure:
   - **Name**: `razorpayx-payroll-backend`
   - **Region**: Choose closest to you (e.g., Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```
     npx prisma db push --accept-data-loss && node dist/index.js
     ```
   - **Instance Type**: `Free`

### Step 3: Add Persistent Disk (1 minute) ⚠️ CRITICAL
1. Scroll down to "Disk"
2. Click "Add Disk"
3. Configure:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src/backend/prisma`
   - **Size**: `1 GB`
4. Click "Add Disk"

### Step 4: Deploy! (1 minute)
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Copy your Render URL (e.g., `https://razorpayx-payroll-backend.onrender.com`)

## Update Frontend

Once deployed, update your production URL:

<function_calls>
<invoke name="search_replace">
<parameter name="file_path">/Users/risheek.ravi/Desktop/Razorpay/razorpayx-payroll-onboarding/src/config/api.ts
