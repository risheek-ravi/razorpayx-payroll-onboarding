import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Reactotron - only in development
if (__DEV__) {
  Reactotron.setAsyncStorageHandler?.(AsyncStorage);
  Reactotron.configure({
    name: 'RazorpayX Payroll',
    // Use your Mac's IP address directly
    host: '192.168.1.5',
  })
    .useReactNative({
      networking: {
        // Log all network requests
        ignoreUrls: /symbolicate/,
      },
      editor: false,
      errors: {veto: () => false},
      overlay: false,
    })
    .connect();

  // Extend console to also log to Reactotron
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);
    Reactotron.log?.(...args);
  };

  console.tron = Reactotron;
}

export default Reactotron;
