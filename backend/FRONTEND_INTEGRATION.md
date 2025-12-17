# Frontend Integration Guide

After deploying your backend to Vercel, follow these steps to connect your React Native frontend.

## Step 1: Get Your Vercel URL

After deployment, you'll receive a URL like:
```
https://your-project-name.vercel.app
```

## Step 2: Update Frontend Configuration

### Option A: Environment-based Configuration (Recommended)

Create or update your frontend configuration file:

```typescript
// src/config/api.ts
const getApiUrl = () => {
  if (__DEV__) {
    // Local development
    return Platform.select({
      ios: 'http://localhost:3001/api/v1',
      android: 'http://10.0.2.2:3001/api/v1',
    });
  }
  
  // Production
  return 'https://your-project-name.vercel.app/api/v1';
};

export const API_BASE_URL = getApiUrl();
```

### Option B: Update Existing Service Files

If you have existing service files (like `dbService.ts`), update them:

```typescript
// services/dbService.ts or src/services/dbService.ts
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: 'http://localhost:3001/api/v1',
      android: 'http://10.0.2.2:3001/api/v1',
    })
  : 'https://your-project-name.vercel.app/api/v1';

// Use API_BASE_URL in all your API calls
export const createBusiness = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/businesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

## Step 3: Test the Connection

### Test Health Endpoint

Add a simple test in your app:

```typescript
// Test connection
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    const data = await response.json();
    console.log('Backend connected:', data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Call this when app starts
useEffect(() => {
  testBackendConnection();
}, []);
```

## Step 4: Handle CORS (if needed for web)

If you're also building a web version, you may need to configure CORS in your backend.

The backend already has CORS enabled with `app.use(cors())`, which allows all origins. For production, you might want to restrict this:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000', // for local web dev
  ],
  credentials: true,
}));
```

## Step 5: Update All API Calls

Search for all hardcoded API URLs in your frontend and replace them with the dynamic `API_BASE_URL`:

```bash
# Search for hardcoded URLs
grep -r "http://localhost:3001" src/
grep -r "http://10.0.2.2:3001" src/
```

Replace with:
```typescript
import { API_BASE_URL } from './config/api';

// Instead of:
fetch('http://localhost:3001/api/v1/employees')

// Use:
fetch(`${API_BASE_URL}/employees`)
```

## Step 6: Add Error Handling

Add proper error handling for network issues:

```typescript
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// Usage
const employees = await fetchWithErrorHandling(`${API_BASE_URL}/employees`);
```

## Step 7: Add Loading States

Update your components to show loading states:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await fetch(`${API_BASE_URL}/employees`);
    // Handle data
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

## Environment Variables (Optional)

For better configuration management, you can use environment variables:

### React Native (.env)

1. Install `react-native-dotenv`:
```bash
yarn add react-native-dotenv
yarn add -D @types/react-native-dotenv
```

2. Create `.env` file:
```env
API_BASE_URL=https://your-project-name.vercel.app/api/v1
```

3. Create `.env.development`:
```env
API_BASE_URL=http://localhost:3001/api/v1
```

4. Use in code:
```typescript
import { API_BASE_URL } from '@env';

const response = await fetch(`${API_BASE_URL}/employees`);
```

## Troubleshooting

### Issue: "Network request failed"
**Solutions:**
- Check if backend is running: `curl https://your-project-name.vercel.app/health`
- Verify URL is correct (no typos)
- Check device/emulator has internet connection
- For Android emulator, use `10.0.2.2` instead of `localhost`

### Issue: "CORS error" (web only)
**Solution:** Configure CORS in backend to allow your frontend domain

### Issue: "Timeout errors"
**Solutions:**
- Vercel serverless functions have cold starts (first request may be slow)
- Add timeout handling in fetch calls
- Consider adding a loading indicator

### Issue: "404 Not Found"
**Solutions:**
- Verify the API endpoint path is correct
- Check Vercel deployment logs
- Ensure `vercel.json` is configured correctly

## Testing Checklist

- [ ] Health endpoint responds
- [ ] Can create business
- [ ] Can create employees
- [ ] Can fetch employee list
- [ ] Can update employee
- [ ] Can delete employee
- [ ] Can create shifts
- [ ] Error handling works
- [ ] Loading states work
- [ ] Works on both iOS and Android (if React Native)

## Production Checklist

- [ ] All hardcoded URLs replaced with `API_BASE_URL`
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Network error handling
- [ ] Timeout handling
- [ ] Backend health check on app start
- [ ] Tested on real devices
- [ ] Analytics/monitoring added (optional)

## Next Steps

1. **Add authentication**: Implement JWT or OAuth
2. **Add request interceptors**: For auth tokens, logging
3. **Implement retry logic**: For failed requests
4. **Add caching**: Use AsyncStorage or React Query
5. **Monitor API usage**: Set up analytics

## Support

- Backend: See `backend/DEPLOYMENT.md`
- Vercel Docs: https://vercel.com/docs
- React Native Networking: https://reactnative.dev/docs/network

