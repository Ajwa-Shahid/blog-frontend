import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse } from '../../../types/auth';
import { apiClient, tokenManager } from '../../../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  register: (credentials: RegisterCredentials) => Promise<ApiResponse<AuthResponse>>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (token && !tokenManager.isTokenExpired()) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        tokenManager.setTokens(response.data.tokens);
        setUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
      
      if (response.success && response.data) {
        tokenManager.setTokens(response.data.tokens);
        setUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    tokenManager.clearTokens();
    
    // Call logout endpoint to invalidate server-side session
    apiClient.post('/auth/logout').catch(console.error);
    
    // Redirect to home
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        tokenManager.clearTokens();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
