# Backend Server Restart Required

## Issue

After updating the Prisma schema and running `npx prisma db push`, the backend server returns a 500 error when fetching payments:

```
ERROR [500] ← http://10.0.2.2:3001/api/v1/payments?businessId=...
ERROR [Error: Internal server error]
```

## Root Cause

The backend server is still using the old Prisma client that doesn't include the new fields (`upiId`, `razorpayPayoutId`) and the `payments` relation on the `Employee` model.

## Solution

**Restart the backend server** to load the updated Prisma client.

### Steps to Fix

1. **Stop the backend server**:
   ```bash
   # In the terminal running the backend (terminal 12)
   # Press Ctrl+C to stop the server
   ```

2. **Restart the backend server**:
   ```bash
   cd backend
   yarn dev
   ```

   Or if you're in the project root:
   ```bash
   cd /Users/risheek.ravi/Desktop/Razorpay/razorpayx-payroll-onboarding/backend
   yarn dev
   ```

3. **Verify the server started successfully**:
   ```
   🚀 Server running on http://0.0.0.0:3001
   📊 API available at http://localhost:3001/api/v1
   📱 Android emulator: http://10.0.2.2:3001/api/v1
   ```

4. **Test the payment API**:
   - Create a new payment from the app
   - Check that payment history loads correctly
   - Verify no 500 errors in the terminal

## What Changed

The Prisma schema was updated to include:

1. **New Payment fields**:
   ```prisma
   model Payment {
     // ... existing fields
     upiId             String?  // ✅ NEW
     razorpayPayoutId  String?  // ✅ NEW
   }
   ```

2. **New Employee relation**:
   ```prisma
   model Employee {
     // ... existing fields
     payments        Payment[]  // ✅ NEW
   }
   ```

3. **Database changes applied**:
   ```bash
   ✅ npx prisma db push
   ✅ npx prisma generate
   ```

## Why Restart is Needed

The Prisma client is generated at build time and cached in memory when the server starts. After schema changes:

1. `npx prisma db push` - Updates the database schema ✅
2. `npx prisma generate` - Regenerates TypeScript types ✅
3. **Server restart** - Loads new Prisma client ⚠️ **REQUIRED**

Without restarting, the server uses the old cached Prisma client which doesn't know about the new fields.

## Alternative: Using nodemon

For automatic restarts during development, the backend is already configured with `nodemon`. However, schema changes require a manual restart because:

- `nodemon` watches TypeScript files
- Prisma client is in `node_modules/@prisma/client`
- Schema changes don't trigger nodemon reload

## Verification

After restarting, verify the payment endpoint works:

```bash
# Test the API directly
curl "http://localhost:3001/api/v1/payments?businessId=YOUR_BUSINESS_ID"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "upiId": "user@paytm",  // ✅ Should be present
      "razorpayPayoutId": "pout_xyz123",  // ✅ Should be present
      ...
    }
  ]
}
```

## Quick Restart Command

If you're in the project root:

```bash
# Stop backend (if running)
pkill -f "yarn dev"

# Restart backend
cd backend && yarn dev
```

## Next Steps

1. ✅ Restart backend server
2. ✅ Test payment creation
3. ✅ Verify payment history loads
4. ✅ Check that transaction details are saved

Once the server is restarted, all features should work correctly! 🎉

