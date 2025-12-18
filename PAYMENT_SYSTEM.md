# Payment System Documentation

## Overview

The payment system allows you to track and manage payments made to employees. Payments are stored in the database and linked to both employees and businesses.

## Payment Schema

### Database Model (Prisma)

```prisma
model Payment {
  id            String   @id @default(uuid())
  type          String   // 'one-time' | 'advance' | 'salary'
  amount        Float
  paymentMode   String   // 'Cash' | 'UPI' | 'Bank Transfer'
  phoneNumber   String?  // Phone number for UPI/Bank Transfer
  narration     String?  // Optional description/reason
  status        String   @default("completed") // 'pending' | 'completed' | 'failed'
  date          String   // Formatted date string
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  businessId    String
  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([businessId])
  @@index([type])
  @@index([status])
}
```

### TypeScript Interface

```typescript
export interface Payment {
  id: string;
  type: 'one-time' | 'advance' | 'salary';
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  phoneNumber?: string;
  narration?: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  employeeId: string;
  businessId: string;
  createdAt: number;
  updatedAt: number;
}
```

## Payment Types

1. **One-Time Payment**: Bonuses, incentives, or other one-time payments
2. **Advance Payment**: Salary advances given to employees
3. **Salary Payment**: Regular salary payments (for future use)

## Payment Modes

1. **Cash**: Direct cash payment
2. **UPI**: Payment via UPI (requires phone number)
3. **Bank Transfer**: Payment via bank transfer (requires phone number)

## API Endpoints

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://laudable-sparkle-production-8104.up.railway.app/api/v1`

### Endpoints

#### 1. Create Payment
```
POST /payments
```

**Request Body:**
```json
{
  "type": "one-time",
  "amount": 5000,
  "paymentMode": "UPI",
  "phoneNumber": "9876543210",
  "narration": "Diwali Bonus",
  "status": "completed",
  "date": "18 Dec 2025",
  "employeeId": "employee-uuid",
  "businessId": "business-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "type": "one-time",
    "amount": 5000,
    "paymentMode": "UPI",
    "phoneNumber": "9876543210",
    "narration": "Diwali Bonus",
    "status": "completed",
    "date": "18 Dec 2025",
    "employeeId": "employee-uuid",
    "businessId": "business-uuid",
    "createdAt": 1702901234567,
    "updatedAt": 1702901234567,
    "employee": {
      "id": "employee-uuid",
      "fullName": "John Doe",
      "phoneNumber": "9876543210"
    }
  }
}
```

#### 2. Get All Payments
```
GET /payments?businessId={businessId}&employeeId={employeeId}&type={type}&status={status}
```

All query parameters are optional.

#### 3. Get Single Payment
```
GET /payments/:id
```

#### 4. Update Payment
```
PATCH /payments/:id
```

**Request Body:**
```json
{
  "amount": 6000,
  "status": "completed"
}
```

#### 5. Delete Payment
```
DELETE /payments/:id
```

#### 6. Get Employee Payment Summary
```
GET /payments/employee/:employeeId/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPayments": 5,
    "totalAmount": 25000,
    "byType": {
      "one-time": {
        "count": 2,
        "amount": 10000
      },
      "advance": {
        "count": 3,
        "amount": 15000
      },
      "salary": {
        "count": 0,
        "amount": 0
      }
    },
    "byStatus": {
      "pending": 0,
      "completed": 5,
      "failed": 0
    }
  }
}
```

## Frontend Integration

### Service Functions

The payment service is available in `src/services/paymentService.ts`:

```typescript
import {savePayment, getPayments, getPaymentById, updatePayment, deletePayment, getEmployeePaymentSummary} from '../services/paymentService';

// Create a payment
const payment = await savePayment({
  type: 'one-time',
  amount: 5000,
  paymentMode: 'UPI',
  phoneNumber: '9876543210',
  narration: 'Diwali Bonus',
  status: 'completed',
  date: '18 Dec 2025',
  employeeId: 'employee-id',
  businessId: 'business-id',
});

// Get all payments for a business
const payments = await getPayments({businessId: 'business-id'});

// Get payments for an employee
const employeePayments = await getPayments({employeeId: 'employee-id'});

// Get payment summary
const summary = await getEmployeePaymentSummary('employee-id');
```

### Usage in CreatePaymentSheet

The `CreatePaymentSheet` component now includes:
- Phone number field (shown for UPI and Bank Transfer)
- Automatic saving to database
- Error handling

When a payment is created:
1. User fills in payment details
2. Phone number is captured for UPI/Bank Transfer
3. Payment is saved to database via API
4. Payment appears in history

## Migration Instructions

### 1. Run Database Migration

```bash
cd backend
chmod +x migrate-payments.sh
./migrate-payments.sh
```

Or manually:

```bash
cd backend
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

### 2. Restart Backend Server

```bash
cd backend
npm run dev
```

### 3. Verify Migration

Test the health endpoint:
```bash
curl http://localhost:3001/health/db
```

## Features

✅ **Payment Tracking**: All payments are stored in the database
✅ **Employee Mapping**: Each payment is linked to a specific employee
✅ **Business Mapping**: Each payment is linked to a specific business
✅ **Payment History**: View all past payments
✅ **Payment Types**: Support for one-time, advance, and salary payments
✅ **Payment Modes**: Cash, UPI, and Bank Transfer
✅ **Phone Number**: Captured for UPI and Bank Transfer payments
✅ **Status Tracking**: Track payment status (pending, completed, failed)
✅ **Payment Summary**: Get aggregated payment statistics per employee

## Data Flow

1. **User creates payment** → `CreatePaymentSheet`
2. **Payment data collected** → Including phone number for UPI/Bank Transfer
3. **API call made** → `savePayment()` in `paymentService.ts`
4. **Backend validates** → Checks employee and business exist
5. **Payment saved** → Stored in database with all relationships
6. **Response returned** → Payment ID and details
7. **UI updated** → Payment appears in history

## Security Considerations

- All payments require valid employee and business IDs
- Phone numbers are optional but recommended for UPI/Bank Transfer
- Payment status can be tracked for audit purposes
- Cascade delete ensures data integrity (deleting employee/business removes their payments)

## Future Enhancements

- [ ] Razorpay integration for actual payouts
- [ ] Payment reconciliation
- [ ] Bulk payment creation
- [ ] Payment reports and analytics
- [ ] Payment reminders
- [ ] Payment approval workflow
- [ ] Payment receipts/invoices

