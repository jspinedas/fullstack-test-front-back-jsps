import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import transactionStatusReducer from '../store/transactionStatusSlice';
import productReducer from '../store/productSlice';
import paymentFlowReducer from '../store/paymentFlowSlice';
import FinalStatusPage from '../FinalStatusPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('FinalStatusPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const createTestStore = (initialState = {}) => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    return configureStore({
      reducer: {
        app: appSlice.reducer,
        transactionStatus: transactionStatusReducer,
        product: productReducer,
        paymentFlow: paymentFlowReducer,
      },
      preloadedState: initialState,
    });
  };

  const renderWithRouter = (store: any, transactionId: string) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/final/${transactionId}`]}>
          <Routes>
            <Route path="/final/:transactionId" element={<FinalStatusPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  it('should render loading state initially', () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockImplementation(
      () =>
        new Promise(() => {
          // never resolves
        }),
    );

    renderWithRouter(store, 'tx-123');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.getByText('Fetching transaction status...'),
    ).toBeInTheDocument();
  });

  it('should render SUCCESS status correctly', async () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactionId: 'tx-success',
        status: 'SUCCESS',
        total: 28000,
        failureReason: null,
      }),
    });

    renderWithRouter(store, 'tx-success');

    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Your payment has been processed successfully.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Transaction ID')).toBeInTheDocument();
    expect(screen.getByText('tx-success')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Back to product')).toBeInTheDocument();
  });

  it('should render FAILED status correctly', async () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactionId: 'tx-failed',
        status: 'FAILED',
        total: 28000,
        failureReason: 'Card declined',
      }),
    });

    renderWithRouter(store, 'tx-failed');

    await waitFor(() => {
      expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Unfortunately, your payment could not be processed.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Reason: Card declined')).toBeInTheDocument();
    expect(screen.getByText('Back to product')).toBeInTheDocument();
  });

  it('should render PENDING status with refresh button', async () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactionId: 'tx-pending',
        status: 'PENDING',
        total: 28000,
        failureReason: null,
      }),
    });

    renderWithRouter(store, 'tx-pending');

    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Your payment is being processed. Please wait a moment.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Refresh status')).toBeInTheDocument();
    expect(screen.getByText('Back to product')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    renderWithRouter(store, 'tx-not-found');

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Transaction not found')).toBeInTheDocument();
    expect(screen.getByText('Back to product')).toBeInTheDocument();
  });

  it('should call navigate when Back to product button is clicked', async () => {
    const store = createTestStore();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transactionId: 'tx-success',
        status: 'SUCCESS',
        total: 28000,
        failureReason: null,
      }),
    });

    renderWithRouter(store, 'tx-success');

    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to product');
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should refresh status when Refresh button is clicked on PENDING', async () => {
    const store = createTestStore();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transactionId: 'tx-pending',
          status: 'PENDING',
          total: 28000,
          failureReason: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transactionId: 'tx-pending',
          status: 'SUCCESS',
          total: 28000,
          failureReason: null,
        }),
      });

    renderWithRouter(store, 'tx-pending');

    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh status');
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });
  });
});
