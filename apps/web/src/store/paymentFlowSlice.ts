import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentStep = 'product' | 'checkout' | 'summary' | 'final';
export type PaymentIntentStatus = 'idle' | 'processing';

export interface PaymentFlowState {
  step: PaymentStep;
  paymentIntentStatus: PaymentIntentStatus;
}

const initialState: PaymentFlowState = {
  step: 'product',
  paymentIntentStatus: 'idle',
};

export const paymentFlowSlice = createSlice({
  name: 'paymentFlow',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<PaymentStep>) => {
      state.step = action.payload;
    },
    beginPayment: (state) => {
      state.paymentIntentStatus = 'processing';
    },
    resetPaymentIntent: (state) => {
      state.paymentIntentStatus = 'idle';
    },
    resetPaymentFlow: (state) => {
      state.step = 'product';
      state.paymentIntentStatus = 'idle';
    },
  },
});

export const { setStep, beginPayment, resetPaymentIntent, resetPaymentFlow } =
  paymentFlowSlice.actions;

export default paymentFlowSlice.reducer;
