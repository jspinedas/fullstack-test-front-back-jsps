import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './App.css';
import ProductPage from './ProductPage';
import SummaryPage from './SummaryPage';
import FinalStatusPage from './FinalStatusPage';
import { loadPersistedState } from './utils/persistedState';
import { rehydratePaymentFlow } from './store/paymentFlowSlice';
import { rehydrateCheckout, openCheckoutModal } from './store/checkoutSlice';
import { fetchProductById } from './store/productSlice';
import type { AppDispatch } from './store';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [rehydrated, setRehydrated] = React.useState(false);
  const hasRunRef = React.useRef(false);

  React.useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    const persisted = loadPersistedState();
    if (!persisted) {
      navigate('/', { replace: true });
      setRehydrated(true);
      return;
    }

    dispatch(
      rehydratePaymentFlow({
        step: persisted.checkoutStep,
        transactionId: persisted.transactionId,
      }),
    );
    dispatch(
      rehydrateCheckout({
        deliveryData: persisted.deliveryData,
        paymentMeta: persisted.paymentMeta,
      }),
    );

    if (persisted.productId) {
      dispatch(fetchProductById(persisted.productId));
    }

    if (persisted.checkoutStep === 'summary') {
      navigate('/summary', { replace: true });
    } else if (persisted.checkoutStep === 'final' && persisted.transactionId) {
      navigate(`/final/${persisted.transactionId}`, { replace: true });
    } else {
      navigate('/', { replace: true });
      if (persisted.checkoutStep === 'checkout') {
        dispatch(openCheckoutModal());
      }
    }

    setRehydrated(true);
  }, [dispatch, navigate]);

  if (!rehydrated) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/final/:transactionId" element={<FinalStatusPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
