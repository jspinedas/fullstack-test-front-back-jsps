import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from './store';
import {
  fetchTransactionStatus,
  resetTransactionStatus,
} from './store/transactionStatusSlice';
import { fetchProductById } from './store/productSlice';
import { resetPaymentFlow, setStep } from './store/paymentFlowSlice';
import { clearPersistedState } from './utils/persistedState';
import Backdrop from './components/Backdrop';

const FinalStatusPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();

  const { status, total, failureReason, loading, error } = useSelector(
    (state: RootState) => state.transactionStatus,
  );
  const product = useSelector((state: RootState) => state.product.data);

  const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    dispatch(setStep('final'));
  }, [dispatch]);

  useEffect(() => {
    if (transactionId) {
      dispatch(fetchTransactionStatus(transactionId));
    }
  }, [dispatch, transactionId]);

  useEffect(() => {
    if (status === 'SUCCESS' || status === 'FAILED') {
      clearPersistedState();
    }
  }, [status]);

  const handleBackToProduct = async () => {
    clearPersistedState();
    dispatch(resetTransactionStatus());
    dispatch(resetPaymentFlow());
    navigate('/');
    if (product?.id) {
      dispatch(fetchProductById(product.id));
    }
  };

  const handleRefreshStatus = () => {
    if (transactionId) {
      dispatch(fetchTransactionStatus(transactionId));
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Backdrop>
          <div className="summary-content">
            <h2>Loading...</h2>
            <p className="product-description">
              Fetching transaction status...
            </p>
          </div>
        </Backdrop>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Backdrop>
          <div className="summary-content">
            <h2>Error</h2>
            <p className="product-description">{error}</p>
            <div className="summary-actions">
              <button
                type="button"
                className="summary-button summary-button-primary"
                onClick={handleBackToProduct}
              >
                Back to product
              </button>
            </div>
          </div>
        </Backdrop>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="app">
        <Backdrop>
          <div className="summary-content">
            <h2>No Transaction Found</h2>
            <p className="product-description">
              Unable to retrieve transaction information.
            </p>
            <div className="summary-actions">
              <button
                type="button"
                className="summary-button summary-button-primary"
                onClick={handleBackToProduct}
              >
                Back to product
              </button>
            </div>
          </div>
        </Backdrop>
      </div>
    );
  }

  return (
    <div className="app">
      <Backdrop>
        <div className="summary-content">
          {status === 'SUCCESS' && (
            <>
              <h2 style={{ color: 'var(--accent)' }}>Payment Successful</h2>
              <p className="product-description">
                Your payment has been processed successfully.
              </p>
            </>
          )}

          {status === 'FAILED' && (
            <>
              <h2 style={{ color: '#d32f2f' }}>Payment Failed</h2>
              <p className="product-description">
                Unfortunately, your payment could not be processed.
              </p>
              {failureReason && (
                <p className="product-description">
                  Reason: {failureReason}
                </p>
              )}
            </>
          )}

          {status === 'PENDING' && (
            <>
              <h2 style={{ color: 'var(--text-muted)' }}>Processing</h2>
              <p className="product-description">
                Your payment is being processed. Please wait a moment.
              </p>
            </>
          )}

          <div className="summary-divider" />

          <div className="summary-item">
            <span className="summary-label">Transaction ID</span>
            <span className="summary-value" style={{ fontSize: '14px' }}>
              {transactionId}
            </span>
          </div>

          {total !== null && (
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <span className="summary-value">
                {priceFormatter.format(total)}
              </span>
            </div>
          )}

          <div className="summary-actions">
            {status === 'PENDING' && (
              <button
                type="button"
                className="summary-button summary-button-secondary"
                onClick={handleRefreshStatus}
              >
                Refresh status
              </button>
            )}
            <button
              type="button"
              className="summary-button summary-button-primary"
              onClick={handleBackToProduct}
            >
              Back to product
            </button>
          </div>
        </div>
      </Backdrop>
    </div>
  );
};

export default FinalStatusPage;
