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
});
