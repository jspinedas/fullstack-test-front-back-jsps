import { configureStore, createSlice } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import checkoutReducer from './checkoutSlice';
import paymentFlowReducer from './paymentFlowSlice';
import transactionStatusReducer from './transactionStatusSlice';
import { savePersistedState } from '../utils/persistedState';

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
    paymentFlow: paymentFlowReducer,
    transactionStatus: transactionStatusReducer,
  },
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

store.subscribe(() => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    savePersistedState(store.getState());
  }, 300);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
