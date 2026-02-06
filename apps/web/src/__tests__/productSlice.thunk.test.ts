import { configureStore } from '@reduxjs/toolkit';
import productReducer, { fetchProductById } from '../store/productSlice';

global.fetch = jest.fn();

describe('productSlice thunk', () => {
  let store = configureStore({
    reducer: { product: productReducer },
  });

  beforeEach(() => {
    store = configureStore({
      reducer: { product: productReducer },
    });
    jest.clearAllMocks();
  });

  it('stores product on success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'product-1',
        name: 'Demo Product',
        description: 'Test Description',
        price: 20000,
        stock: 12,
      }),
    });

    await store.dispatch(fetchProductById('product-1'));

    const state = store.getState().product;
    expect(state.status).toBe('succeeded');
    expect(state.data?.id).toBe('product-1');
  });

  it('stores error when response is not ok', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Product not found' }),
    });

    await store.dispatch(fetchProductById('missing'));

    const state = store.getState().product;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Product not found');
  });

  it('stores default error when response body is invalid', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    await store.dispatch(fetchProductById('missing'));

    const state = store.getState().product;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Product not found');
  });
});
