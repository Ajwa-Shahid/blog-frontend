import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthTokens, ApiResponse, ApiHeaders } from '../types/auth';

// Cookie utilities
export const cookieUtils = {
  set: (name: string, value: string, options: {
    days?: number;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean;
  } = {}) => {
    if (typeof window === 'undefined') return;
    
    const { days = 7, secure = true, sameSite = 'strict' } = options;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
    
    if (secure) cookie += '; secure';
    if (sameSite) cookie += `; samesite=${sameSite}`;
    
    document.cookie = cookie;
  },

  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  remove: (name: string) => {
    if (typeof window === 'undefined') return;
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};

// Token management using cookies (adjusted for backend requirements)
export const tokenManager = {
  setTokens: (tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;
    
    // Store access token (expires in 15 minutes as per backend)
    cookieUtils.set('accessToken', tokens.accessToken, { 
      days: 0.0104, // 15 minutes in days (15/60/24)
      secure: true, 
      sameSite: 'strict' 
    });
    
    // Store refresh token (expires in 7 days as per backend)
    cookieUtils.set('refreshToken', tokens.refreshToken, { 
      days: 7, 
      secure: true, 
      sameSite: 'strict' 
    });
    
    // Calculate and store token expiration (15 minutes from now)
    const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes in milliseconds
    cookieUtils.set('tokenExpiresAt', expiresAt.toString(), { 
      days: 7, 
      secure: true, 
      sameSite: 'strict' 
    });
    
    // Set auth session indicator
    cookieUtils.set('authSession', 'true', { 
      days: 7, 
      secure: true, 
      sameSite: 'strict' 
    });
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return cookieUtils.get('accessToken');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return cookieUtils.get('refreshToken');
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    
    const expiresAt = cookieUtils.get('tokenExpiresAt');
    if (!expiresAt) return true;
    
    // Add 1 minute buffer to refresh before actual expiration
    return Date.now() > (parseInt(expiresAt) - 60000);
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    cookieUtils.remove('accessToken');
    cookieUtils.remove('refreshToken');
    cookieUtils.remove('tokenExpiresAt');
    cookieUtils.remove('authSession');
  },

  // Check if user is authenticated based on cookies
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const authSession = cookieUtils.get('authSession');
    const accessToken = cookieUtils.get('accessToken');
    
    return !!(authSession && accessToken && !tokenManager.isTokenExpired());
  }
};

// API client with axios and proper headers
class ApiClient {
  private axiosInstance: AxiosInstance;
  private csrfToken: string | null = null;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL: baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 10000,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    // Initialize CSRF token if needed
    this.initializeCSRF();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add Authorization header if token exists
        const token = tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing operations
        if (this.csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Update the authorization header and retry
            const token = tokenManager.getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.axiosInstance(originalRequest);
          } else {
            // Refresh failed, redirect to login
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/signin';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async initializeCSRF() {
    // Only initialize CSRF if explicitly enabled in environment
    if (process.env.NEXT_PUBLIC_ENABLE_CSRF !== 'true') {
      return;
    }

    try {
      const response = await this.axiosInstance.get('/csrf-token');
      this.csrfToken = response.data.token;
      console.log('🔒 CSRF token initialized successfully');
    } catch (error) {
      // Silently handle CSRF initialization failure (backend may not support it)
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
        console.warn('⚠️ CSRF not available (backend may not support it)');
      }
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      // Match backend RefreshTokenDto structure
      const response = await this.axiosInstance.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      if (response.data.success && response.data.data) {
        // Backend only returns new accessToken, keep existing refreshToken
        const currentRefreshToken = tokenManager.getRefreshToken();
        const newTokens = {
          accessToken: response.data.data.accessToken,
          refreshToken: currentRefreshToken || '',
          expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes from now
        };
        
        tokenManager.setTokens(newTokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    tokenManager.clearTokens();
    return false;
  }

  async request<T = any>(
    endpoint: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if token is expired before making request
      if (tokenManager.isTokenExpired() && 
          endpoint !== '/auth/login' && 
          endpoint !== '/auth/register') {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
          throw new Error('Authentication expired');
        }
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.request({
        url: endpoint,
        ...config,
      });

      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload method
  async uploadFile<T = any>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for common operations
export const apiUtils = {
  // Handle API errors consistently (axios format)
  handleError: (error: any, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return defaultMessage;
  },

  // Format validation errors
  formatValidationErrors: (errors: Record<string, string[]>) => {
    const formatted: Record<string, string> = {};
    for (const [field, messages] of Object.entries(errors)) {
      formatted[field] = messages[0]; // Take first error message
    }
    return formatted;
  },

  // Create form data with proper headers
  createFormData: (data: Record<string, any>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }
    return formData;
  },

  // Check if error is network related
  isNetworkError: (error: any) => {
    return error.code === 'NETWORK_ERROR' || 
           error.message === 'Network Error' ||
           !error.response;
  },

  // Check if error is timeout
  isTimeoutError: (error: any) => {
    return error.code === 'ECONNABORTED' || 
           error.message.includes('timeout');
  },

  // Get error status code
  getErrorStatus: (error: any) => {
    return error.response?.status || 0;
  }
};
