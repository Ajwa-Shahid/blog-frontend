import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slice/counterSlice';
import authReducer from './slices/authSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
