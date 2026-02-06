import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import productReducer from '../store/productSlice';
import checkoutReducer from '../store/checkoutSlice';
import ProductPage from '../ProductPage';

describe('ProductPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'product-1',
        name: 'Demo Product',
        description: 'Producto de ejemplo',
        price: 20000,
        stock: 12,
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders product data and CTA button', async () => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    const store = configureStore({
      reducer: {
        app: appSlice.reducer,
        product: productReducer,
        checkout: checkoutReducer,
      },
    });

    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>,
    );

    expect(await screen.findByText('Demo Product')).toBeInTheDocument();
    expect(screen.getByText('Pay with credit card')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    const store = configureStore({
      reducer: {
        app: appSlice.reducer,
        product: productReducer,
        checkout: checkoutReducer,
      },
      preloadedState: {
        product: { data: null, status: 'loading', error: null },
        checkout: { paymentData: null, paymentMeta: null, deliveryData: null, ui: { isCheckoutModalOpen: false } },
      },
    });

    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>,
    );

    expect(screen.getByText('Loading product...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    const store = configureStore({
      reducer: {
        app: appSlice.reducer,
        product: productReducer,
        checkout: checkoutReducer,
      },
      preloadedState: {
        product: { data: null, status: 'failed', error: 'Error loading product' },
        checkout: { paymentData: null, paymentMeta: null, deliveryData: null, ui: { isCheckoutModalOpen: false } },
      },
    });

    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>,
    );

    expect(screen.getByText('Error loading product')).toBeInTheDocument();
  });

  it('renders empty state when product is missing', () => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    const store = configureStore({
      reducer: {
        app: appSlice.reducer,
        product: productReducer,
        checkout: checkoutReducer,
      },
      preloadedState: {
        product: { data: null, status: 'succeeded', error: null },
        checkout: { paymentData: null, paymentMeta: null, deliveryData: null, ui: { isCheckoutModalOpen: false } },
      },
    });

    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>,
    );

    expect(screen.getByText('No product available')).toBeInTheDocument();
  });
});
