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
});
