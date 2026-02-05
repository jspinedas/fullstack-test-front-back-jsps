import { configureStore, createSlice } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import checkoutReducer from './checkoutSlice';

const appSlice = createSlice({
  name: 'app',
  initialState: { initialized: true },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    product: productReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
