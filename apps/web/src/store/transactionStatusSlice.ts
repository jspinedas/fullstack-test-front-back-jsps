import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface TransactionStatusState {
  transactionId: string | null;
  status: TransactionStatus | null;
  total: number | null;
  failureReason: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionStatusState = {
  transactionId: null,
  status: null,
  total: null,
  failureReason: null,
  loading: false,
  error: null,
};

export const fetchTransactionStatus = createAsyncThunk(
  'transactionStatus/fetch',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/transactions/${transactionId}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          return rejectWithValue('Transaction not found');
        }
        return rejectWithValue('Failed to fetch transaction status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  },
);

export const transactionStatusSlice = createSlice({
  name: 'transactionStatus',
  initialState,
  reducers: {
    resetTransactionStatus: (state) => {
      state.transactionId = null;
      state.status = null;
      state.total = null;
      state.failureReason = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionId = action.payload.transactionId;
        state.status = action.payload.status;
        state.total = action.payload.total;
        state.failureReason = action.payload.failureReason;
      })
      .addCase(fetchTransactionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTransactionStatus } = transactionStatusSlice.actions;

export default transactionStatusSlice.reducer;
