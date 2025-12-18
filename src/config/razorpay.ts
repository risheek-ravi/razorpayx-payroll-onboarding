/**
 * Razorpay Configuration
 *
 * Replace these values with your actual Razorpay credentials
 *
 * To get your credentials:
 * 1. Login to Razorpay Dashboard: https://dashboard.razorpay.com/
 * 2. Go to Settings > API Keys
 * 3. Generate or copy your Key ID and Key Secret
 * 4. For Account Number, go to RazorpayX > Settings > Account Details
 */

export const RAZORPAY_CONFIG = {
  // Test Mode Credentials (for development)
  test: {
    apiKey: 'rzp_live_RshcgrCrFefnKT',
    apiSecret: 'FoO0FA7EXqWJd4ObKpGCI0qT',
    accountNumber: '5678495909128214',
  },

  // Live Mode Credentials (for production)
  live: {
    apiKey: 'rzp_live_RshcgrCrFefnKT',
    apiSecret: 'FoO0FA7EXqWJd4ObKpGCI0qT',
    accountNumber: '5678495909128214',
  },
};

// Use test credentials in development, live in production
export const getRazorpayCredentials = () => {
  const isProduction = !__DEV__;
  return isProduction ? RAZORPAY_CONFIG.live : RAZORPAY_CONFIG.test;
};

/**
 * Instructions for setting up Razorpay:
 *
 * 1. Sign up for Razorpay account at https://razorpay.com/
 * 2. Complete KYC verification
 * 3. Enable RazorpayX (for payouts)
 * 4. Add funds to your RazorpayX account
 * 5. Update the credentials in this file
 * 6. Test with test mode first before going live
 *
 * Note: Keep your API Secret secure and never commit it to version control
 * Consider using environment variables for production
 */
