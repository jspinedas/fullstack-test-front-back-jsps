import { configureStore } from '@reduxjs/toolkit';
import paymentFlowReducer, {
  setStep,
  rehydratePaymentFlow,
  resetPaymentFlow,
  startCheckout,
  confirmCheckout,
} from '../store/paymentFlowSlice';

global.fetch = jest.fn();

describe('paymentFlowSlice', () => {
  let store = configureStore({
    reducer: { paymentFlow: paymentFlowReducer },
  });

  beforeEach(() => {
    store = configureStore({
      reducer: { paymentFlow: paymentFlowReducer },
    });
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = store.getState().paymentFlow;
    expect(state.step).toBe('product');
    expect(state.paymentIntentStatus).toBe('idle');
    expect(state.transactionId).toBe(null);
    expect(state.error).toBe(null);
  });

  it('should handle setStep action', () => {
    store.dispatch(setStep('checkout'));
    expect(store.getState().paymentFlow.step).toBe('checkout');

    store.dispatch(setStep('summary'));
    expect(store.getState().paymentFlow.step).toBe('summary');

    store.dispatch(setStep('final'));
    expect(store.getState().paymentFlow.step).toBe('final');
  });

  it('should handle rehydratePaymentFlow action', () => {
    store.dispatch(setStep('summary'));
    store.dispatch(
      rehydratePaymentFlow({
        step: 'summary',
        transactionId: 'tx-123',
      }),
    );

    const state = store.getState().paymentFlow;
    expect(state.step).toBe('summary');
    expect(state.transactionId).toBe('tx-123');
    expect(state.paymentIntentStatus).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('should handle resetPaymentFlow action', () => {
    store.dispatch(setStep('summary'));
    store.dispatch(resetPaymentFlow());

    expect(store.getState().paymentFlow.step).toBe('product');
    expect(store.getState().paymentFlow.paymentIntentStatus).toBe('idle');
    expect(store.getState().paymentFlow.transactionId).toBe(null);
    expect(store.getState().paymentFlow.error).toBe(null);
  });

  describe('startCheckout thunk', () => {
    it('should handle successful start checkout', async () => {
      const mockTransactionId = 'tx-123';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ transactionId: mockTransactionId }),
      });

      await store.dispatch(
        startCheckout({
          productId: 'product-1',
          deliveryData: {
            fullName: 'John Doe',
            phone: '1234567890',
            address: '123 Main St',
            city: 'City',
          },
          baseFee: 5000,
          deliveryFee: 3000,
        }),
      );

      const state = store.getState().paymentFlow;
      expect(state.transactionId).toBe(mockTransactionId);
    });

    it('should handle failed start checkout', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Product not found',
      });

      await store.dispatch(
        startCheckout({
          productId: 'product-1',
          deliveryData: {
            fullName: 'John Doe',
            phone: '1234567890',
            address: '123 Main St',
            city: 'City',
          },
          baseFee: 5000,
          deliveryFee: 3000,
        }),
      );

      const state = store.getState().paymentFlow;
      expect(state.paymentIntentStatus).toBe('failed');
      expect(state.error).toBeTruthy();
    });
  });

  describe('confirmCheckout thunk', () => {
    it('should handle successful payment confirmation', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transactionId: 'tx-123',
          status: 'SUCCESS',
          message: 'Payment successful',
        }),
      });

      await store.dispatch(
        confirmCheckout({
          transactionId: 'tx-123',
          paymentData: {
            cardNumber: '4242424242424242',
            cardExpMonth: '12',
            cardExpYear: '25',
            cardCvc: '123',
            cardHolder: 'John Doe',
          },
        }),
      );

      const state = store.getState().paymentFlow;
      expect(state.paymentIntentStatus).toBe('success');
    });

    it('should handle failed payment confirmation', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Payment failed',
      });

      await store.dispatch(
        confirmCheckout({
          transactionId: 'tx-123',
          paymentData: {
            cardNumber: '4242424242424242',
            cardExpMonth: '12',
            cardExpYear: '25',
            cardCvc: '123',
            cardHolder: 'John Doe',
          },
        }),
      );

      const state = store.getState().paymentFlow;
      expect(state.paymentIntentStatus).toBe('failed');
      expect(state.error).toBeTruthy();
    });
  });
});
