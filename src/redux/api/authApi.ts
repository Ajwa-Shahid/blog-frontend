import { baseApi } from './baseApi';
import { User } from '../slices/authSlice';

// Auth request/response interfaces (Updated to match backend DTOs)
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
  role_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Create auth API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Login user
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout user
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Refresh token
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // Get current user profile
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Verify email
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
    }),

    // Resend verification email
    resendVerification: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;