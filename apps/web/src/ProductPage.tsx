import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from './store/productSlice';
import { openCheckoutModal } from './store/checkoutSlice';
import { setStep } from './store/paymentFlowSlice';
import CheckoutModal from './components/CheckoutModal';
import type { RootState, AppDispatch } from './store';

const ProductPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status, error } = useSelector(
    (state: RootState) => state.product,
  );
  const { ui: checkoutUI } = useSelector(
    (state: RootState) => state.checkout,
  );

  const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    dispatch(setStep('product'));
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductById('product-1'));
    }
  }, [dispatch, status]);

  if (status === 'loading') {
    return (
      <div className="app">
        <div className="product-shell">
          <div className="product-card product-state">
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="app">
        <div className="product-shell">
          <div className="product-card product-state">
            <p>{error ?? 'Error loading product'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <div className="product-shell">
          <div className="product-card product-state">
            <p>No product available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="product-shell">
        <div className="product-card">
          <div className="product-header">
            <span className="product-eyebrow">Featured product</span>
            <h1>{data.name}</h1>
          </div>
          <p className="product-description">{data.description}</p>
          <div className="product-meta">
            <div>
              <span className="meta-label">Price</span>
              <span className="meta-value">
                {priceFormatter.format(data.price)}
              </span>
            </div>
            <div>
              <span className="meta-label">Stock</span>
              <span className="meta-value">{data.stock}</span>
            </div>
          </div>
          <button
            type="button"
            className="product-cta"
            onClick={() => dispatch(openCheckoutModal())}
          >
            Pay with credit card
          </button>
        </div>
      </div>
      {checkoutUI.isCheckoutModalOpen && <CheckoutModal />}
    </div>
  );
};

export default ProductPage;
