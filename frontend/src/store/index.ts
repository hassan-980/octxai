import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sellerReducer from './slices/sellerSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
