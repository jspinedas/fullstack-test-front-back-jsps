import { configureStore } from '@reduxjs/toolkit';
import paymentFlowReducer, {
  setStep,
  beginPayment,
  resetPaymentIntent,
  resetPaymentFlow,
} from '../store/paymentFlowSlice';

describe('paymentFlowSlice', () => {
  let store = configureStore({
    reducer: { paymentFlow: paymentFlowReducer },
  });

  beforeEach(() => {
    store = configureStore({
      reducer: { paymentFlow: paymentFlowReducer },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().paymentFlow;
    expect(state.step).toBe('product');
    expect(state.paymentIntentStatus).toBe('idle');
  });

  it('should handle setStep action', () => {
    store.dispatch(setStep('checkout'));
    expect(store.getState().paymentFlow.step).toBe('checkout');

    store.dispatch(setStep('summary'));
    expect(store.getState().paymentFlow.step).toBe('summary');

    store.dispatch(setStep('final'));
    expect(store.getState().paymentFlow.step).toBe('final');
  });

  it('should handle beginPayment action', () => {
    store.dispatch(beginPayment());
    expect(store.getState().paymentFlow.paymentIntentStatus).toBe(
      'processing',
    );
  });

  it('should handle resetPaymentIntent action', () => {
    store.dispatch(beginPayment());
    expect(store.getState().paymentFlow.paymentIntentStatus).toBe(
      'processing',
    );

    store.dispatch(resetPaymentIntent());
    expect(store.getState().paymentFlow.paymentIntentStatus).toBe('idle');
  });

  it('should handle resetPaymentFlow action', () => {
    store.dispatch(setStep('summary'));
    store.dispatch(beginPayment());

    store.dispatch(resetPaymentFlow());

    expect(store.getState().paymentFlow.step).toBe('product');
    expect(store.getState().paymentFlow.paymentIntentStatus).toBe('idle');
  });
});
