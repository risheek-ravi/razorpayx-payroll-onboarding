# Razorpay Payout Integration

## Overview

The payroll application now integrates with Razorpay's Payout API to automatically process payments when a phone number is provided. This enables real-time UPI and Bank Transfer payments to employees.

## Flow Diagram

```
User Creates Payment (with phone number)
    ↓
Check Payment Mode (UPI or Bank Transfer)
    ↓
Call Razorpay Payout API
    ↓
Success → Save payment with status "completed"
Failed → Save payment with status "failed"
No phone number → Save payment with status "completed" (Cash)
```

## Features

### ✅ Automatic Payout Processing
- **UPI Payments**: Automatically process UPI payouts when phone number is provided
- **Bank Transfers**: Process bank transfers (NEFT/IMPS/RTGS) with employee bank details
- **Cash Payments**: Record cash payments without API calls

### ✅ Payment Status Tracking
- **Pending**: Razorpay is processing the payout
- **Completed**: Payout successfully processed
- **Failed**: Payout failed (still saved in database for record)

### ✅ Error Handling
- Graceful fallback if Razorpay API fails
- Payment still saved to database even if payout fails
- User-friendly error messages

## Setup Instructions

### 1. Get Razorpay Credentials

1. **Sign up for Razorpay**:
   - Visit https://razorpay.com/
   - Create an account and complete KYC

2. **Enable RazorpayX**:
   - Go to RazorpayX section
   - Complete RazorpayX activation
   - Add funds to your account

3. **Get API Credentials**:
   - Go to Settings > API Keys
   - Generate or copy your:
     - Key ID (e.g., `rzp_test_xxxxx` or `rzp_live_xxxxx`)
     - Key Secret
   - Go to RazorpayX > Settings > Account Details
   - Copy your Account Number

### 2. Configure Credentials

Update the file `src/config/razorpay.ts`:

```typescript
export const RAZORPAY_CONFIG = {
  test: {
    apiKey: 'rzp_test_YOUR_TEST_KEY',        // Replace
    apiSecret: 'YOUR_TEST_SECRET',            // Replace
    accountNumber: '7878780080316316',        // Replace
  },
  live: {
    apiKey: 'rzp_live_YOUR_LIVE_KEY',        // Replace
    apiSecret: 'YOUR_LIVE_SECRET',            // Replace
    accountNumber: 'YOUR_LIVE_ACCOUNT_NUMBER', // Replace
  },
};
```

**Important**: 
- Use **test credentials** during development
- Switch to **live credentials** only when ready for production
- Never commit secrets to version control

### 3. Test Mode vs Live Mode

The app automatically uses:
- **Test Mode**: When running in development (`__DEV__` is true)
- **Live Mode**: When running in production

## How It Works

### UPI Payments

When user creates a payment with:
- Payment Mode: **UPI**
- Phone Number: **Provided**

The app:
1. Gets UPI ID from employee details or generates one (`phone@paytm`)
2. Calls Razorpay UPI Payout API
3. Saves payment to database with appropriate status

```typescript
// Example UPI Payout
{
  accountNumber: 'YOUR_ACCOUNT',
  amount: 5000,
  upiId: '9876543210@paytm',
  accountHolderName: 'John Doe',
  contactPhone: '9876543210',
  narration: 'Bonus Payment',
}
```

### Bank Transfer Payments

When user creates a payment with:
- Payment Mode: **Bank Transfer**
- Phone Number: **Provided**
- Employee has bank details

The app:
1. Gets bank details from employee record
2. Calls Razorpay Bank Transfer API
3. Saves payment to database with appropriate status

```typescript
// Example Bank Transfer
{
  accountNumber: 'YOUR_ACCOUNT',
  amount: 5000,
  beneficiaryName: 'John Doe',
  beneficiaryAccountNumber: '1234567890',
  ifscCode: 'HDFC0001234',
  mode: 'IMPS',
  contactPhone: '9876543210',
  narration: 'Advance Payment',
}
```

### Cash Payments

When user creates a payment with:
- Payment Mode: **Cash**
- No phone number required

The app:
1. Skips Razorpay API call
2. Saves payment directly to database as "completed"

## Payment Status Flow

### Successful Payout
```
User creates payment
  ↓
Razorpay API called
  ↓
Payout processed successfully
  ↓
Payment saved with status: "completed"
  ↓
User sees success message
```

### Failed Payout
```
User creates payment
  ↓
Razorpay API called
  ↓
Payout fails (insufficient balance, invalid details, etc.)
  ↓
Payment saved with status: "failed"
  ↓
User sees error message
  ↓
Payment record kept for audit
```

### Missing Bank Details
```
User creates Bank Transfer payment
  ↓
Employee has no bank details
  ↓
Payment saved with status: "pending"
  ↓
User sees warning message
  ↓
Admin can update bank details and retry
```

## Code Structure

### Configuration
- **File**: `src/config/razorpay.ts`
- **Purpose**: Store Razorpay credentials
- **Functions**: `getRazorpayCredentials()`

### Payout Functions
- **File**: `src/services/dbService.ts`
- **Functions**:
  - `createUPIPayout()` - Process UPI payouts
  - `createBankPayout()` - Process bank transfers
  - `createRazorpayPayout()` - Base payout function

### Payment Handler
- **File**: `src/screens/FinalizePayrollScreen.tsx`
- **Function**: `handleCreatePayment()`
- **Logic**:
  1. Check if phone number provided
  2. Determine payment mode
  3. Call appropriate Razorpay function
  4. Handle success/failure
  5. Save to database

## API Request Examples

### UPI Payout Request

```json
{
  "account_number": "7878780080316316",
  "amount": 500000,
  "currency": "INR",
  "mode": "UPI",
  "purpose": "salary",
  "fund_account": {
    "account_type": "vpa",
    "vpa": {
      "address": "9876543210@paytm"
    },
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210",
      "type": "employee"
    }
  },
  "queue_if_low_balance": true,
  "reference_id": "PAY-1702901234567",
  "narration": "Bonus Payment"
}
```

### Bank Transfer Request

```json
{
  "account_number": "7878780080316316",
  "amount": 500000,
  "currency": "INR",
  "mode": "IMPS",
  "purpose": "salary",
  "fund_account": {
    "account_type": "bank_account",
    "bank_account": {
      "name": "John Doe",
      "ifsc": "HDFC0001234",
      "account_number": "1234567890"
    },
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "9876543210",
      "type": "employee"
    }
  },
  "queue_if_low_balance": true,
  "reference_id": "PAY-1702901234567",
  "narration": "Advance Payment"
}
```

## Error Handling

### Common Errors

1. **Insufficient Balance**
   ```
   Error: Your account does not have enough balance to carry out the payout operation
   ```
   **Solution**: Add funds to your RazorpayX account

2. **Invalid Credentials**
   ```
   Error: Authentication failed
   ```
   **Solution**: Check your API Key and Secret in `razorpay.ts`

3. **Invalid UPI ID**
   ```
   Error: VPA address is invalid
   ```
   **Solution**: Verify employee's UPI ID format

4. **Invalid Bank Details**
   ```
   Error: Invalid IFSC code
   ```
   **Solution**: Verify employee's bank details

### Error Recovery

All errors are handled gracefully:
- Payment is saved with status "failed"
- User sees descriptive error message
- Admin can view failed payments
- Retry is possible by creating new payment

## Testing

### Test Mode Testing

1. **Use Test Credentials**:
   - Ensure test API key is configured
   - Use test account number

2. **Test UPI Payout**:
   ```
   Phone: 9876543210
   Amount: ₹100
   Mode: UPI
   ```

3. **Test Bank Transfer**:
   ```
   Phone: 9876543210
   Amount: ₹100
   Mode: Bank Transfer
   Account: Test account details
   ```

4. **Check Razorpay Dashboard**:
   - Go to RazorpayX > Payouts
   - Verify test payouts appear

### Live Mode Testing

⚠️ **Only test in live mode when ready for production**

1. Switch to live credentials
2. Use small amounts for testing
3. Verify with real employee accounts
4. Monitor Razorpay dashboard

## Security Best Practices

### 1. Protect API Secrets
```typescript
// ❌ Bad - Hardcoded in code
const secret = 'YOUR_SECRET_KEY';

// ✅ Good - Use environment variables (future enhancement)
const secret = process.env.RAZORPAY_SECRET;
```

### 2. Validate Before Payout
- Verify employee exists
- Check phone number format
- Validate amount > 0
- Confirm bank details for transfers

### 3. Audit Trail
- All payments saved to database
- Status tracked (pending/completed/failed)
- Timestamps recorded
- Employee/business mapping maintained

### 4. Error Logging
```typescript
console.log('Payment saved:', savedPayment);
console.error('Razorpay error:', error);
```

## Monitoring & Analytics

### Payment Metrics

Track in database:
- Total payouts processed
- Success rate
- Failure rate
- Average payout amount
- Payment mode distribution

### Query Examples

```sql
-- Get payout success rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM Payment
WHERE phoneNumber IS NOT NULL;

-- Get payouts by mode
SELECT paymentMode, COUNT(*), SUM(amount)
FROM Payment
GROUP BY paymentMode;
```

## Troubleshooting

### Payout Not Processing

**Checklist**:
1. ✅ Razorpay credentials configured correctly
2. ✅ Account has sufficient balance
3. ✅ Phone number provided
4. ✅ Employee details correct
5. ✅ Internet connection available
6. ✅ Razorpay API is up (check status.razorpay.com)

### Payment Saved but Status "Failed"

**Reason**: Razorpay API call failed but payment record was saved

**Action**:
1. Check error message in logs
2. Fix the issue (balance, details, etc.)
3. Create new payment to retry

### Payment Status "Pending"

**Reasons**:
- Razorpay is processing the payout
- Missing bank details (for transfers)
- Queue enabled due to low balance

**Action**:
- Check Razorpay dashboard for status
- Update employee bank details if missing
- Add funds if balance is low

## Future Enhancements

- [ ] Webhook integration for status updates
- [ ] Bulk payout processing
- [ ] Payout scheduling
- [ ] Retry failed payouts
- [ ] Payment reconciliation
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Payout templates

## Support

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com/
- Docs: https://razorpay.com/docs/payouts/
- Support: support@razorpay.com

### Application Support
- Check logs in terminal
- Review payment records in database
- See [PAYMENT_SYSTEM.md](./PAYMENT_SYSTEM.md) for API details

## Conclusion

The Razorpay integration enables:
- ✅ Automated UPI and Bank Transfer payouts
- ✅ Real-time payment processing
- ✅ Comprehensive error handling
- ✅ Complete audit trail
- ✅ Easy configuration
- ✅ Test and live mode support

All payments are tracked in the database with proper status, ensuring no payment is lost even if the payout fails!

