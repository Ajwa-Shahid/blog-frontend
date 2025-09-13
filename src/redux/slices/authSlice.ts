import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cookieUtils } from '../../utils/api';

// Update the User interface to match backend structure
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  role_id: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize state from cookies if available
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const savedToken = cookieUtils.get('accessToken');
    const savedRefreshToken = cookieUtils.get('refreshToken');
    const savedUser = cookieUtils.get('user');

    if (savedToken && savedUser) {
      try {
        return {
          user: JSON.parse(decodeURIComponent(savedUser)),
          accessToken: savedToken,
          refreshToken: savedRefreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        // If parsing fails, clear invalid data
        cookieUtils.remove('accessToken');
        cookieUtils.remove('refreshToken');
        cookieUtils.remove('user');
      }
    }
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    setCredentials: (state, action: PayloadAction<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>) => {
      const { user, accessToken, refreshToken } = action.payload;
      
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Store in cookies
      if (typeof window !== 'undefined') {
        cookieUtils.set('accessToken', accessToken, { days: 1 });
        cookieUtils.set('refreshToken', refreshToken, { days: 7 });
        cookieUtils.set('user', encodeURIComponent(JSON.stringify(user)), { days: 7 });
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear cookies
      if (typeof window !== 'undefined') {
        cookieUtils.remove('accessToken');
        cookieUtils.remove('refreshToken');
        cookieUtils.remove('user');
      }
    },

    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update cookie
        if (typeof window !== 'undefined') {
          cookieUtils.set('user', encodeURIComponent(JSON.stringify(state.user)), { days: 7 });
        }
      }
    },
  },
});

export const {
  loginStart,
  setCredentials,
  logout,
  setAuthError,
  clearAuthError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;