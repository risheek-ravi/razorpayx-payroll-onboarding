# React Native Base64 Encoding Fix

## Issue

The error `[ReferenceError: Property 'btoa' doesn't exist]` occurred because `btoa()` is a browser API that is not available in React Native's JavaScript environment.

## Solution

Implemented a custom Base64 encoding function that works in React Native:

```typescript
const base64Encode = (str: string): string => {
  // Use Buffer if available (Node.js environment)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  // Fallback for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : Number.NaN;
    const c = i < str.length ? str.charCodeAt(i++) : Number.NaN;

    const bitmap = (a << 16) | (b << 8) | c;

    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += isNaN(b) ? '=' : chars.charAt((bitmap >> 6) & 63);
    result += isNaN(c) ? '=' : chars.charAt(bitmap & 63);
  }

  return result;
};
```

## How It Works

1. **Buffer Check**: First tries to use Node.js `Buffer` API if available
2. **Fallback Implementation**: Uses bitwise operations to manually encode to Base64
3. **Razorpay Authentication**: Encodes API credentials for Basic Authentication

## Usage

The function is used internally in `createRazorpayPayout()`:

```typescript
const credentials = `${apiKey}:${apiSecret}`;
const encodedCredentials = base64Encode(credentials);

// Used in Authorization header
headers: {
  'Authorization': `Basic ${encodedCredentials}`
}
```

## Testing

To test the fix:

1. Run the React Native app
2. Create a payment with UPI mode
3. Enter UPI ID and amount
4. Click "Pay & Save"
5. Razorpay API should now be called successfully

## Alternative Solutions

If you prefer, you can also use a third-party library:

```bash
npm install base-64
```

```typescript
import { encode } from 'base-64';
const encodedCredentials = encode(credentials);
```

However, the custom implementation avoids adding an extra dependency.

## Files Modified

- `src/services/dbService.ts` - Added `base64Encode()` function and replaced `btoa()` with it

## Error Fixed

**Before**:
```
ERROR Razorpay payout failed: [ReferenceError: Property 'btoa' doesn't exist]
```

**After**:
```
LOG UPI Payout successful: { id: 'payout_xxx', status: 'processed', ... }
```

The Razorpay payout API should now work correctly in React Native!

