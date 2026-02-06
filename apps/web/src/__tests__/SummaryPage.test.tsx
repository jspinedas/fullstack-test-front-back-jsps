import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import SummaryPage from '../SummaryPage';
import productReducer from '../store/productSlice';
import checkoutReducer from '../store/checkoutSlice';
import paymentFlowReducer from '../store/paymentFlowSlice';

describe('SummaryPage', () => {
  const createMockStore = (initialState = {}) => {
    const defaultState = {
      product: {
        data: {
          id: 'product-1',
          name: 'Test Product',
          description: 'Test Description',
          price: 20000,
          stock: 10,
        },
        status: 'succeeded',
        error: null,
      },
      checkout: {
        paymentData: {
          cardNumber: '4111111111111111',
          expMonth: '12',
          expYear: '2026',
          cvc: '123',
          cardHolderName: 'John Doe',
          brand: 'VISA',
        },
        deliveryData: {
          fullName: 'Jane Doe',
          phone: '3001234567',
          address: 'Test Address',
          city: 'Test City',
        },
        ui: { isCheckoutModalOpen: false },
      },
      paymentFlow: {
        step: 'summary',
        paymentIntentStatus: 'idle',
      },
    };

    return configureStore({
      reducer: {
        product: productReducer,
        checkout: checkoutReducer,
        paymentFlow: paymentFlowReducer,
      },
      preloadedState: {
        ...defaultState,
        ...initialState,
      },
    });
  };

  it('should render summary with correct product and totals', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    expect(screen.getByText(/Base Fee/)).toBeInTheDocument();
    expect(screen.getByText(/Delivery Fee/)).toBeInTheDocument();
    expect(screen.getByText(/Total/)).toBeInTheDocument();
  });

  it('should show incomplete message when product data is missing', () => {
    const store = createMockStore({
      product: { data: null, status: 'idle', error: null },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Incomplete checkout')).toBeInTheDocument();
    expect(screen.getByText('Back to product')).toBeInTheDocument();
  });

  it('should show incomplete message when payment data is missing', () => {
    const store = createMockStore({
      checkout: {
        paymentData: null,
        deliveryData: null,
        ui: { isCheckoutModalOpen: false },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Incomplete checkout')).toBeInTheDocument();
  });

  it('should show incomplete message when delivery data is missing', () => {
    const store = createMockStore({
      checkout: {
        paymentData: {
          cardNumber: '4111111111111111',
          expMonth: '12',
          expYear: '2026',
          cvc: '123',
          cardHolderName: 'John Doe',
          brand: 'VISA',
        },
        deliveryData: null,
        ui: { isCheckoutModalOpen: false },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Incomplete checkout')).toBeInTheDocument();
  });

  it('should disable buttons during processing', () => {
    const store = createMockStore({
      paymentFlow: { step: 'summary', paymentIntentStatus: 'processing' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    const payButton = screen.getByRole('button', { name: /Processing/i });
    const backButton = screen.getByRole('button', { name: /Back/i });

    expect(payButton).toBeDisabled();
    expect(backButton).toBeDisabled();
  });

  it('should show Processing text when payment is in progress', () => {
    const store = createMockStore({
      paymentFlow: { step: 'summary', paymentIntentStatus: 'processing' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should have Pay button enabled when idle', () => {
    const store = createMockStore({
      paymentFlow: { step: 'summary', paymentIntentStatus: 'idle' },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SummaryPage />
        </BrowserRouter>
      </Provider>,
    );

    const payButton = screen.getByRole('button', { name: /Pay/i });
    expect(payButton).not.toBeDisabled();
  });
});
