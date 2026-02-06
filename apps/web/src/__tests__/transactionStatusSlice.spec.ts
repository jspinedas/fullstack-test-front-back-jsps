import { configureStore } from '@reduxjs/toolkit';
import transactionStatusReducer, {
  fetchTransactionStatus,
  resetTransactionStatus,
} from '../store/transactionStatusSlice';

global.fetch = jest.fn();

describe('transactionStatusSlice', () => {
  let store = configureStore({
    reducer: { transactionStatus: transactionStatusReducer },
  });

  beforeEach(() => {
    store = configureStore({
      reducer: { transactionStatus: transactionStatusReducer },
    });
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = store.getState().transactionStatus;
    expect(state.transactionId).toBe(null);
    expect(state.status).toBe(null);
    expect(state.total).toBe(null);
    expect(state.failureReason).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle resetTransactionStatus action', () => {
    store.dispatch(resetTransactionStatus());

    const state = store.getState().transactionStatus;
    expect(state.transactionId).toBe(null);
    expect(state.status).toBe(null);
    expect(state.total).toBe(null);
    expect(state.failureReason).toBe(null);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  describe('fetchTransactionStatus thunk', () => {
    it('should handle pending state', () => {
      (fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(() => {
            // never resolves
          }),
      );

      store.dispatch(fetchTransactionStatus('tx-123'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle successful fetch with SUCCESS status', async () => {
      const mockResponse = {
        transactionId: 'tx-123',
        status: 'SUCCESS',
        total: 28000,
        failureReason: null,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await store.dispatch(fetchTransactionStatus('tx-123'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.transactionId).toBe('tx-123');
      expect(state.status).toBe('SUCCESS');
      expect(state.total).toBe(28000);
      expect(state.failureReason).toBe(null);
      expect(state.error).toBe(null);
    });

    it('should handle successful fetch with FAILED status', async () => {
      const mockResponse = {
        transactionId: 'tx-456',
        status: 'FAILED',
        total: 28000,
        failureReason: 'Payment declined',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await store.dispatch(fetchTransactionStatus('tx-456'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.transactionId).toBe('tx-456');
      expect(state.status).toBe('FAILED');
      expect(state.total).toBe(28000);
      expect(state.failureReason).toBe('Payment declined');
      expect(state.error).toBe(null);
    });

    it('should handle successful fetch with PENDING status', async () => {
      const mockResponse = {
        transactionId: 'tx-789',
        status: 'PENDING',
        total: 28000,
        failureReason: null,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await store.dispatch(fetchTransactionStatus('tx-789'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.transactionId).toBe('tx-789');
      expect(state.status).toBe('PENDING');
      expect(state.total).toBe(28000);
      expect(state.error).toBe(null);
    });

    it('should handle 404 not found error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await store.dispatch(fetchTransactionStatus('tx-not-found'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Transaction not found');
    });

    it('should handle server error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await store.dispatch(fetchTransactionStatus('tx-error'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch transaction status');
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await store.dispatch(fetchTransactionStatus('tx-123'));

      const state = store.getState().transactionStatus;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
});
