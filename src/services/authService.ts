import { apiClient } from '../utils/api';
import { store } from '../redux/store';
import axios from 'axios';
import { 
  setCredentials, 
  setAuthError, 
  setSuccessMessage,
  clearSuccessMessage,
  clearLoading,
  loginStart, 
  logout as logoutAction 
} from '../redux/slices/authSlice';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    role_id: string;
    status: 'active' | 'inactive' | 'banned'; // Fixed to match backend
    created_at: string;
    updated_at: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      role_id: string;
      status: 'active' | 'inactive' | 'banned'; // Fixed to match backend
      created_at: string;
      updated_at: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      store.dispatch(loginStart());
      
      // Use axios directly instead of apiClient to avoid the ApiResponse wrapper
      const response = await axios.post<RegisterResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Registration failed');
      }
      
      // Clear loading state and show success message
      store.dispatch(clearLoading());
      store.dispatch(setSuccessMessage(response.data.message || 'Account created successfully! Please sign in to continue.'));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      store.dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      store.dispatch(loginStart());
      
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Login failed');
      }
      
      // Dispatch success to Redux store
      store.dispatch(setCredentials({
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      }));
      
      // Set success message
      store.dispatch(setSuccessMessage(response.data.message || 'Login successful! Welcome back.'));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      store.dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Forgot password request failed';
      throw new Error(errorMessage);
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on backend, we should clear local state
      console.warn('Logout request failed, but clearing local state');
    } finally {
      store.dispatch(logoutAction());
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data.accessToken;
    } catch (error: any) {
      store.dispatch(logoutAction());
      throw new Error('Token refresh failed');
    }
  }
}

export const authService = new AuthService();