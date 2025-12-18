# Payment System Setup Guide

## Quick Start

Follow these steps to set up the payment tracking system in your payroll application.

## Step 1: Run Database Migration

The payment schema needs to be added to your database. Run the migration script:

```bash
cd backend
./migrate-payments.sh
```

This will:
- Create the `Payment` table in your database
- Add relationships to `Employee` and `Business` tables
- Generate the Prisma client with Payment types

### Manual Migration (Alternative)

If the script doesn't work, run these commands manually:

```bash
cd backend
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

## Step 2: Restart Backend Server

After migration, restart your backend server:

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3001`

## Step 3: Verify Setup

### Check Database Health

```bash
curl http://localhost:3001/health/db
```

You should see a successful response with database connection status.

### Test Payment API

Create a test payment:

```bash
curl -X POST http://localhost:3001/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "type": "one-time",
    "amount": 1000,
    "paymentMode": "Cash",
    "narration": "Test Payment",
    "status": "completed",
    "date": "18 Dec 2025",
    "employeeId": "your-employee-id",
    "businessId": "your-business-id"
  }'
```

Replace `your-employee-id` and `your-business-id` with actual IDs from your database.

## Step 4: Test in Mobile App

1. **Start your mobile app** (React Native)
2. **Navigate to Finalize Payroll screen**
3. **Click on "One-Time" or "Advance" tab**
4. **Click "+ Create Payment" button**
5. **Fill in payment details**:
   - Select an employee
   - Enter amount
   - Choose payment mode (Cash/UPI/Bank Transfer)
   - If UPI or Bank Transfer is selected, enter phone number
   - Add optional narration
6. **Click "Pay & Save"**
7. **Enter security PIN** (default: 1234)
8. **Payment should be saved** and appear in the history

## Features Now Available

### ✅ Payment Creation
- Create one-time payments (bonuses, incentives)
- Create advance payments (salary advances)
- Automatic database storage

### ✅ Payment Tracking
- All payments linked to employees
- All payments linked to business
- Payment history persists across app restarts

### ✅ Payment Modes
- **Cash**: Direct cash payments
- **UPI**: Payments via UPI (with phone number)
- **Bank Transfer**: Bank transfers (with phone number)

### ✅ Phone Number Field
- Automatically shown for UPI and Bank Transfer
- Hidden for Cash payments
- Pre-filled from employee data when available

### ✅ Payment History
- View all past payments
- Grouped by type (One-Time vs Advance)
- Shows employee name, amount, date, and reason

## API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments` | Create a new payment |
| GET | `/api/v1/payments` | Get all payments (with filters) |
| GET | `/api/v1/payments/:id` | Get single payment |
| PATCH | `/api/v1/payments/:id` | Update a payment |
| DELETE | `/api/v1/payments/:id` | Delete a payment |
| GET | `/api/v1/payments/employee/:employeeId/summary` | Get payment summary for employee |

## Troubleshooting

### Migration Fails

**Error**: "Migration failed"

**Solution**: 
1. Make sure your database file exists: `backend/prisma/dev.db`
2. Try deleting the database and recreating:
   ```bash
   cd backend
   rm prisma/dev.db
   npx prisma migrate dev
   ```

### Backend Won't Start

**Error**: "Cannot find module '@prisma/client'"

**Solution**:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Payments Not Saving

**Error**: "Failed to save payment"

**Checklist**:
1. ✅ Backend server is running
2. ✅ Database migration completed
3. ✅ Employee ID exists in database
4. ✅ Business ID exists in database
5. ✅ Check backend logs for errors

### Phone Number Not Showing

**Issue**: Phone number field doesn't appear

**Solution**: 
- Phone number field only shows when "UPI" or "Bank Transfer" is selected
- Select "Cash" and then select "UPI" or "Bank Transfer" again

## Database Schema

The Payment table structure:

```
Payment
├── id (UUID, Primary Key)
├── type (one-time | advance | salary)
├── amount (Float)
├── paymentMode (Cash | UPI | Bank Transfer)
├── phoneNumber (String, Optional)
├── narration (String, Optional)
├── status (pending | completed | failed)
├── date (String)
├── employeeId (Foreign Key → Employee)
├── businessId (Foreign Key → Business)
├── createdAt (DateTime)
└── updatedAt (DateTime)
```

## Next Steps

1. **Test payment creation** with different payment modes
2. **Verify payments persist** after app restart
3. **Check payment history** in One-Time and Advance tabs
4. **Review payment data** in the database:
   ```bash
   cd backend
   npx prisma studio
   ```
   This opens a GUI to view your database

## Support

For detailed API documentation, see [PAYMENT_SYSTEM.md](./PAYMENT_SYSTEM.md)

For backend setup issues, see [backend/README.md](./backend/README.md)

