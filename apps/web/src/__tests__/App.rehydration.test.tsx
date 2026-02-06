import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/productSlice';
import checkoutReducer from '../store/checkoutSlice';
import paymentFlowReducer from '../store/paymentFlowSlice';
import transactionStatusReducer from '../store/transactionStatusSlice';
import App from '../App';
import { savePersistedState, clearPersistedState } from '../utils/persistedState';

const createTestStore = () =>
  configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
      paymentFlow: paymentFlowReducer,
      transactionStatus: transactionStatusReducer,
    },
  });

describe('App rehydration', () => {
  beforeEach(() => {
    clearPersistedState();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'product-1',
        name: 'Demo Product',
        description: 'Example product',
        price: 20000,
        stock: 12,
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    clearPersistedState();
    jest.resetAllMocks();
  });

  it('should rehydrate and navigate to summary page when persisted state exists', async () => {
    const persistedState = {
      product: { data: { id: 'product-1' } },
      checkout: {
        deliveryData: {
          fullName: 'John Doe',
          phone: '3001234567',
          address: '123 Main St',
          city: 'Bogotá',
        },
        paymentData: null,
        paymentMeta: {
          brand: 'VISA' as const,
          last4: '1111',
        },
      },
      paymentFlow: { step: 'summary' as const, transactionId: null },
      transactionStatus: { status: null },
    };

    savePersistedState(persistedState);

    const store = createTestStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });
  });

  it('should navigate to final page when persisted state has final step', async () => {
    const persistedState = {
      product: { data: { id: 'product-1' } },
      checkout: {
        deliveryData: null,
        paymentData: null,
        paymentMeta: null,
      },
      paymentFlow: {
        step: 'final' as const,
        transactionId: 'tx-123',
      },
      transactionStatus: { status: null },
    };

    savePersistedState(persistedState);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'product-1',
          name: 'Demo Product',
          description: 'Example product',
          price: 20000,
          stock: 12,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transactionId: 'tx-123',
          status: 'SUCCESS',
          total: 26500,
          failureReason: null,
        }),
      });

    const store = createTestStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });
  });

  it('should navigate to product page when no persisted state exists', async () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Pay with credit card')).toBeInTheDocument();
    });
  });

  it('should navigate to product page when persisted state is corrupted', async () => {
    localStorage.setItem('checkout_state', '{invalid json');

    const store = createTestStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Pay with credit card')).toBeInTheDocument();
    });
  });
});
