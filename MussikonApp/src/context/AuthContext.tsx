import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, User } from '../services/api';
import {jwtDecode} from 'jwt-decode';


interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  changeRole: (newRole: 'leader' | 'musician') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  USER: '@mussikon_user',
  TOKEN: '@mussikon_token',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;


  // Cargar datos de autenticación al iniciar la app
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
      ]);

      let expiredToken = false;
      if (storedToken) {
        expiredToken = await verifyToken(storedToken);
      }
      if (expiredToken) {
        console.log('Stored token is expired or invalid');
        await clearAuth();
        setIsLoading(false);
        return;
      }
      console.log(`User: ${storedUser}}` );

      console.log(`Token: ${storedToken}}` );

      if (storedUser && storedToken) {
        console.log('Loading stored auth - User:', storedUser ? 'Present' : 'Missing', 'Token:', storedToken ? 'Present' : 'Missing');
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        console.log('No stored auth found - User:', storedUser ? 'Present' : 'Missing', 'Token:', storedToken ? 'Present' : 'Missing');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeAuth = async (userData: User, authToken: string) => {
    try {
      console.log('Storing auth data - User:', userData.email, 'Token:', authToken ? 'Present' : 'Missing');
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, authToken),
      ]);
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.success) {
        console.log('Login successful - Storing token:', response.token ? 'Present' : 'Missing');
        setUser(response.user);
        setToken(response.token);
        await storeAuth(response.user, response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Re-lanzar el error para que el LoginScreen pueda manejarlo
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      if (token) {
        await apiService.logout();
      }
      await loadStoredAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      await clearAuth();
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        await storeAuth(response.user, response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      // Re-lanzar el error para que el RegisterScreen pueda manejarlo
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changeRole = async (newRole: 'leader' | 'musician'): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('No token available');
      }

      const response = await apiService.changeRole(newRole, token);
      
      if (response.success) {
             // Update user's active role
             setUser(prevUser => prevUser ? { ...prevUser, active_role: newRole } : null);
             await storeAuth({ ...user!, active_role: newRole }, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Change role error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    changeRole,
  };

  const verifyToken  = async (token: string | null) => {
    try {
        // Debugging logs
      if (!token) return true; // Consider null/undefined token as expired/invalid
      const decoded: any = jwtDecode(token);
      if(!decoded.exp) return true;
      const now = Date.now() / 1000;
      return decoded.exp < now;
    } catch (error) {
      console.error('\n\nError verifying token:', error,'\n\n');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
