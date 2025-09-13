import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// Base query with authentication headers
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store
    const token = (getState() as RootState).auth?.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base query with re-authentication
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result?.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {
          refreshToken: (api.getState() as RootState).auth?.refreshToken,
        },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store the new token
      api.dispatch(setCredentials(refreshResult.data));
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch(logout());
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post', 'Comment', 'Category', 'Tag'],
  endpoints: () => ({}),
});

// Import auth actions
// import { setCredentials, logout } from '../slices/authSlice';

// Temporary placeholders until authSlice is created
const setCredentials = (data: any) => ({ type: 'auth/setCredentials', payload: data });
const logout = () => ({ type: 'auth/logout' });