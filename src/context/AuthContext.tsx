import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BusinessDetails} from '../types';
import {getLatestBusinessDetails} from '../services/dbService';

const AUTH_STORAGE_KEY = 'razorpayx_auth_business_id';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  business: BusinessDetails | null;
}

interface AuthContextType extends AuthState {
  login: (business: BusinessDetails) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    business: null,
  });

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedBusinessId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

      if (storedBusinessId) {
        // Fetch the business details from API
        const business = await getLatestBusinessDetails();

        if (business && business.id === storedBusinessId) {
          setState({
            isLoading: false,
            isLoggedIn: true,
            business,
          });
          return;
        }
      }

      // No valid session
      setState({
        isLoading: false,
        isLoggedIn: false,
        business: null,
      });
    } catch (error) {
      console.log('[Auth] Error checking auth state:', error);
      setState({
        isLoading: false,
        isLoggedIn: false,
        business: null,
      });
    }
  };

  const login = async (business: BusinessDetails) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, business.id);
      setState({
        isLoading: false,
        isLoggedIn: true,
        business,
      });
      console.log('[Auth] Logged in:', business.businessEmail);
    } catch (error) {
      console.log('[Auth] Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setState({
        isLoading: false,
        isLoggedIn: false,
        business: null,
      });
      console.log('[Auth] Logged out');
    } catch (error) {
      console.log('[Auth] Error during logout:', error);
    }
  };

  const refreshAuth = async () => {
    setState(prev => ({...prev, isLoading: true}));
    await checkAuthState();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

