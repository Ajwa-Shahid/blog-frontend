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

// Token management
export const tokenManager = {
  setTokens: (tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage for persistence
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tokenExpiresAt', tokens.expiresAt.toString());
    
    // Also store in httpOnly-like cookie (for additional security in real app)
    cookieUtils.set('authSession', 'true', { days: 7, secure: true });
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return true;
    
    return Date.now() > parseInt(expiresAt);
  },

  clearTokens: () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    cookieUtils.remove('authSession');
  }
};

// API client with proper headers
class ApiClient {
  private baseURL: string;
  private csrfToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
    // Initialize CSRF in background without blocking the app
    this.initializeCSRF().catch(() => {
      // Silently handle CSRF initialization failure
    });
  }

  private async initializeCSRF() {
    try {
      const response = await fetch(`${this.baseURL}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.csrfToken = data.token;
    } catch (error) {
      // Only log as warning, don't throw to avoid blocking the app
      console.warn('Failed to fetch CSRF token (backend may not be running):', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    const token = tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing operations
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    return headers;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (response.ok) {
        const data: ApiResponse<AuthTokens> = await response.json();
        if (data.success && data.data) {
          tokenManager.setTokens(data.data);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    tokenManager.clearTokens();
    return false;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseURL}${endpoint}`;
    
    // If token is expired, try to refresh
    if (tokenManager.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        // Redirect to login if refresh fails (except for login/register endpoints)
        window.location.href = '/signin';
        throw new Error('Authentication expired');
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (response.status === 401) {
        // Token might be invalid, try refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          config.headers = {
            ...this.getHeaders(),
            ...options.headers,
          };
          const retryResponse = await fetch(url, config);
          return await retryResponse.json();
        } else {
          tokenManager.clearTokens();
          window.location.href = '/signin';
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for common operations
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error: any, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.message) {
      return error.response.data.message;
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
      } else {
        formData.append(key, String(value));
      }
    }
    return formData;
  }
};
