import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config';

export type PaymentStep = 'product' | 'checkout' | 'summary' | 'final';
export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export interface PaymentFlowState {
  step: PaymentStep;
  paymentIntentStatus: PaymentStatus;
  transactionId: string | null;
  error: string | null;
}

const initialState: PaymentFlowState = {
  step: 'product',
  paymentIntentStatus: 'idle',
  transactionId: null,
  error: null,
};

export const startCheckout = createAsyncThunk(
  'paymentFlow/startCheckout',
  async (
    input: {
      productId: string;
      deliveryData: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
      };
      baseFee: number;
      deliveryFee: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || 'Failed to start checkout');
      }

      const data = await response.json();
      return data.transactionId;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const confirmCheckout = createAsyncThunk(
  'paymentFlow/confirmCheckout',
  async (
    input: {
      transactionId: string;
      paymentData: {
        cardNumber: string;
        cardExpMonth: string;
        cardExpYear: string;
        cardCvc: string;
        cardHolder: string;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || 'Payment failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const paymentFlowSlice = createSlice({
  name: 'paymentFlow',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<PaymentStep>) => {
      state.step = action.payload;
    },
    rehydratePaymentFlow: (
      state,
      action: PayloadAction<{ step: PaymentStep; transactionId: string | null }>,
    ) => {
      state.step = action.payload.step;
      state.transactionId = action.payload.transactionId;
      state.paymentIntentStatus = 'idle';
      state.error = null;
    },
    resetPaymentFlow: (state) => {
      state.step = 'product';
      state.paymentIntentStatus = 'idle';
      state.transactionId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startCheckout.pending, (state) => {
        state.paymentIntentStatus = 'processing';
        state.error = null;
      })
      .addCase(startCheckout.fulfilled, (state, action) => {
        state.transactionId = action.payload;
      })
      .addCase(startCheckout.rejected, (state, action) => {
        state.paymentIntentStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(confirmCheckout.pending, (state) => {
        state.paymentIntentStatus = 'processing';
        state.error = null;
      })
      .addCase(confirmCheckout.fulfilled, (state, action) => {
        if (action.payload.status === 'SUCCESS') {
          state.paymentIntentStatus = 'success';
        } else {
          state.paymentIntentStatus = 'failed';
          state.error = action.payload.message || 'Payment failed';
        }
      })
      .addCase(confirmCheckout.rejected, (state, action) => {
        state.paymentIntentStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setStep, rehydratePaymentFlow, resetPaymentFlow } =
  paymentFlowSlice.actions;

export default paymentFlowSlice.reducer;
