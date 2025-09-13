import { baseApi } from './baseApi';
import { User } from '../slices/authSlice';

// Auth request/response interfaces
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
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
    refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
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