import { apiClient } from '../utils/api';
import { store } from '../redux/store';
import { 
  setCredentials, 
  setAuthError, 
  loginStart, 
  logout as logoutAction 
} from '../redux/slices/authSlice';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
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
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    role_id: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
    updated_at: string;
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      store.dispatch(loginStart());
      
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Dispatch success to Redux store
      store.dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));
      
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
      
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Dispatch success to Redux store
      store.dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));
      
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