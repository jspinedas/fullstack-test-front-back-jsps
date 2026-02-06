import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from './store';
import {
  setStep,
  resetPaymentFlow,
  startCheckout,
  confirmCheckout,
} from './store/paymentFlowSlice';
import { calculateTotals } from './utils/calculateTotals';
import Backdrop from './components/Backdrop';

const SummaryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const product = useSelector((state: RootState) => state.product.data);
  const { paymentData, deliveryData } = useSelector(
    (state: RootState) => state.checkout,
  );
  const { paymentIntentStatus, transactionId } = useSelector(
    (state: RootState) => state.paymentFlow,
  );
  const [toast, setToast] = React.useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  const toastTimerRef = React.useRef<number | null>(null);

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
            <p>
              Some required information is missing. Please go back to the
              product to continue.
            </p>
            <button
              type="button"
              className="product-cta"
              onClick={() => {
                navigate('/');
                dispatch(resetPaymentFlow());
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

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handlePay = async () => {
    try {
      let txId = transactionId;

      if (!txId) {
        const startResult = await dispatch(
          startCheckout({
            productId: product.id,
            deliveryData: {
              fullName: deliveryData.fullName,
              phone: deliveryData.phone,
              address: deliveryData.address,
              city: deliveryData.city,
            },
            baseFee: totals.baseFee,
            deliveryFee: totals.deliveryFee,
          }),
        ).unwrap();
        txId = startResult;
      }

      const confirmResult = await dispatch(
        confirmCheckout({
          transactionId: txId,
          paymentData: {
            cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
            cardExpMonth: paymentData.expMonth,
            cardExpYear: paymentData.expYear,
            cardCvc: paymentData.cvc,
            cardHolder: paymentData.cardHolderName,
          },
        }),
      ).unwrap();

      if (confirmResult.status === 'SUCCESS') {
        dispatch(setStep('final'));
        showToast('success', 'Payment successful.');
      } else if (confirmResult.status === 'PROCESSING') {
        showToast('info', 'Payment is being processed. Please wait...');
      } else {
        showToast('error', 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      showToast('error', 'Payment failed. Please try again.');
    }
  };

  const handleBack = () => {
    dispatch(resetPaymentFlow());
    navigate('/');
  };

  return (
    <div className="app">
      <Backdrop>
        <div className="summary-content">
          <h2>Order Summary</h2>

          {toast && (
            <div className={`toast toast-${toast.type}`}>{toast.message}</div>
          )}

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
