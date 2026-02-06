import reducer, { fetchProductById } from './productSlice';

describe('productSlice', () => {
  it('returns initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      data: null,
      status: 'idle',
      error: null,
    });
  });

  it('handles fulfilled state', () => {
    const payload = {
      id: 'product-1',
      name: 'Demo Product',
      description: 'Producto de ejemplo',
      price: 20000,
      stock: 12,
    };

    const state = reducer(
      { data: null, status: 'loading', error: null },
      fetchProductById.fulfilled(payload, 'requestId', 'product-1'),
    );

    expect(state.status).toBe('succeeded');
    expect(state.data).toEqual(payload);
  });

  it('handles pending state', () => {
    const state = reducer(
      { data: null, status: 'idle', error: 'Previous error' },
      fetchProductById.pending('requestId', 'product-1'),
    );

    expect(state.status).toBe('loading');
    expect(state.error).toBe(null);
  });

  it('handles rejected state with payload', () => {
    const state = reducer(
      { data: null, status: 'loading', error: null },
      fetchProductById.rejected(
        new Error('Failed'),
        'requestId',
        'product-1',
        'Product not found',
      ),
    );

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Product not found');
  });

  it('handles rejected state with default message', () => {
    const state = reducer(
      { data: null, status: 'loading', error: null },
      fetchProductById.rejected(new Error('Failed'), 'requestId', 'product-1'),
    );

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Product not found');
  });
});
