import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
};

type ProductState = {
  data: Product | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ProductState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('product/fetchById', async (productId, { rejectWithValue }) => {
  const response = await fetch(`/products/${productId}`);

  if (!response.ok) {
    let message = 'Product not found';
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string') {
        message = data.message;
      }
    } catch {
      message = 'Product not found';
    }
    return rejectWithValue(message);
  }

  const data = (await response.json()) as Product;
  return data;
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Product not found';
      });
  },
});

export default productSlice.reducer;
