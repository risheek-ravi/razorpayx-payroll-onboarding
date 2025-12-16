// Import Reactotron first for debugging (must be before other imports)
if (__DEV__) {
  require('./src/ReactotronConfig').default;
}

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BladeProvider} from '@razorpay/blade/components';
import {bladeTheme} from '@razorpay/blade/tokens';
import {AuthProvider} from './src/context/AuthContext';
import {AppNavigator} from './src/navigation/AppNavigator';

// Network logging - shows in adb logcat
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    console.log(`🌐 [${method}] → ${url}`);
    if (init?.body) {
      console.log('📤 Body:', JSON.stringify(init.body).slice(0, 500));
    }
    const startTime = Date.now();
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startTime;
      console.log(`✅ [${response.status}] ← ${url} (${duration}ms)`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [ERROR] ← ${url} (${duration}ms)`, error);
      throw error;
    }
  };
}

console.log('🔥 App loaded - Network logging enabled');

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <BladeProvider themeTokens={bladeTheme} colorScheme="light">
        <SafeAreaProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </BladeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
