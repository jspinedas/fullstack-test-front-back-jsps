import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from './store';
import { setStep, beginPayment, resetPaymentIntent } from './store/paymentFlowSlice';
import { calculateTotals } from './utils/calculateTotals';
import Backdrop from './components/Backdrop';

const SummaryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const product = useSelector((state: RootState) => state.product.data);
  const { paymentData, deliveryData } = useSelector(
    (state: RootState) => state.checkout,
  );
  const { paymentIntentStatus } = useSelector(
    (state: RootState) => state.paymentFlow,
  );

  const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  if (!product || !paymentData || !deliveryData) {
    return (
      <div className="app">
        <div className="product-shell">
          <div className="product-card product-state">
            <h2>Incomplete checkout</h2>
            <p>Some required information is missing. Please go back to the product to continue.</p>
            <button
              type="button"
              className="product-cta"
              onClick={() => {
                navigate('/');
                dispatch(resetPaymentIntent());
              }}
            >
              Back to product
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals(product.price);

  const handlePay = () => {
    dispatch(beginPayment());
    setTimeout(() => {
      dispatch(setStep('final'));
    }, 2000);
  };

  const handleBack = () => {
    dispatch(resetPaymentIntent());
    navigate('/');
  };

  return (
    <div className="app">
      <Backdrop>
        <div className="summary-content">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span className="summary-label">Product: {product.name}</span>
            <span className="summary-value">
              {priceFormatter.format(totals.productAmount)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Base Fee</span>
            <span className="summary-value">
              {priceFormatter.format(totals.baseFee)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Delivery Fee</span>
            <span className="summary-value">
              {priceFormatter.format(totals.deliveryFee)}
            </span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item summary-total">
            <span className="summary-label">Total</span>
            <span className="summary-value">
              {priceFormatter.format(totals.total)}
            </span>
          </div>
          <div className="summary-actions">
            <button
              type="button"
              className="summary-button summary-button-secondary"
              onClick={handleBack}
              disabled={paymentIntentStatus === 'processing'}
            >
              Back
            </button>
            <button
              type="button"
              className="summary-button summary-button-primary"
              onClick={handlePay}
              disabled={paymentIntentStatus === 'processing'}
            >
              {paymentIntentStatus === 'processing'
                ? 'Processing...'
                : 'Pay'}
            </button>
          </div>
        </div>
      </Backdrop>
    </div>
  );
};

export default SummaryPage;
