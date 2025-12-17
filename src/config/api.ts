import {Platform} from 'react-native';

/**
 * API Configuration
 *
 * This file centralizes API endpoint configuration for the app.
 *
 * Development Mode (__DEV__ = true):
 * - iOS Simulator: http://localhost:3001/api/v1
 * - Android Emulator: http://10.0.2.2:3001/api/v1
 * - Physical Device: Use your computer's local IP (e.g., http://192.168.x.x:3001/api/v1)
 *
 * Production Mode (__DEV__ = false):
 * - Railway Deployment: https://laudable-sparkle-production-8104.up.railway.app/api/v1
 */

// Production API URL (Railway)
const PRODUCTION_API_URL =
  'https://laudable-sparkle-production-8104.up.railway.app/api/v1';

// Development API URLs
const DEVELOPMENT_API_URLS = {
  ios: 'http://localhost:3001/api/v1',
  android: 'http://10.0.2.2:3001/api/v1',
  // For testing on physical device, uncomment and update with your local IP:
  // default: 'http://192.168.1.100:3001/api/v1',
};

/**
 * Get the appropriate API base URL based on environment and platform
 */
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode - use local backend
    const url = Platform.select({
      ios: DEVELOPMENT_API_URLS.ios,
      android: DEVELOPMENT_API_URLS.android,
      default: DEVELOPMENT_API_URLS.ios,
    });

    if (__DEV__) {
      console.log(`[API Config] Using development URL: ${url}`);
    }

    return url || DEVELOPMENT_API_URLS.ios;
  }

  // Production mode - use Railway deployment
  console.log(`[API Config] Using production URL: ${PRODUCTION_API_URL}`);
  return PRODUCTION_API_URL;
};

/**
 * API Base URL
 * Use this constant throughout your app for API calls
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Health check endpoint
 */
export const HEALTH_ENDPOINT = API_BASE_URL.replace('/api/v1', '/health');

/**
 * Test API connection
 * Useful for debugging and verifying backend connectivity
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      console.log('[API Config] ✅ Backend connection successful:', data);
      return true;
    }

    console.error('[API Config] ❌ Backend health check failed:', data);
    return false;
  } catch (error) {
    console.error('[API Config] ❌ Backend connection error:', error);
    return false;
  }
};
