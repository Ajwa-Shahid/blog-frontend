// Authentication Types (Updated to match backend)
export interface User {
  id: string;
  username: string;
  email: string;
  role_id?: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  role_id?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, string[]>;
}

// API Headers Type
export interface ApiHeaders {
  'Content-Type': string;
  'Authorization'?: string;
  'X-CSRF-Token'?: string;
  [key: string]: string | undefined;
}
