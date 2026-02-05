import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  saveCheckoutData,
  closeCheckoutModal,
} from '../store/checkoutSlice';
import { setStep } from '../store/paymentFlowSlice';
import {
  validateCardNumber,
  validateExpMonth,
  validateExpYear,
  validateCvc,
  validateCardHolderName,
  validatePhone,
  validateFullName,
  validateAddress,
  validateCity,
  detectCardBrand,
} from '../utils/cardValidation';
import type { AppDispatch } from '../store';
import './CheckoutModal.css';

interface FormErrors {
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  cardHolderName?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

const CheckoutModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const brand = detectCardBrand(cardNumber);

  const digitsOnly = (value: string, maxLength: number) =>
    value.replace(/\D/g, '').slice(0, maxLength);

  const lettersOnly = (value: string) =>
    value.replace(/[^\p{L}\s]/gu, '');

  const updateFieldError = (
    field: keyof FormErrors,
    validator: (value: string) => { isValid: boolean; error?: string },
    value: string,
  ) => {
    const result = validator(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.isValid ? undefined : result.error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const cardNumberValidation = validateCardNumber(cardNumber);
    if (!cardNumberValidation.isValid) {
      newErrors.cardNumber = cardNumberValidation.error;
    }

    const expMonthValidation = validateExpMonth(expMonth);
    if (!expMonthValidation.isValid) {
      newErrors.expMonth = expMonthValidation.error;
    }

    const expYearValidation = validateExpYear(expYear);
    if (!expYearValidation.isValid) {
      newErrors.expYear = expYearValidation.error;
    }

    const cvcValidation = validateCvc(cvc);
    if (!cvcValidation.isValid) {
      newErrors.cvc = cvcValidation.error;
    }

    const cardHolderValidation = validateCardHolderName(cardHolderName);
    if (!cardHolderValidation.isValid) {
      newErrors.cardHolderName = cardHolderValidation.error;
    }

    const fullNameValidation = validateFullName(fullName);
    if (!fullNameValidation.isValid) {
      newErrors.fullName = fullNameValidation.error;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    const addressValidation = validateAddress(address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error;
    }

    const cityValidation = validateCity(city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    dispatch(
      saveCheckoutData({
        paymentData: {
          cardNumber,
          expMonth,
          expYear,
          cvc,
          cardHolderName,
          brand,
        },
        deliveryData: {
          fullName,
          phone,
          address,
          city,
        },
      }),
    );

    setSuccessMessage('Datos guardados');
    setTimeout(() => {
      dispatch(setStep('checkout'));
      navigate('/summary');
      setSuccessMessage('');
    }, 2000);
  };

  const handleCancel = () => {
    dispatch(closeCheckoutModal());
    setCardNumber('');
    setExpMonth('');
    setExpYear('');
    setCvc('');
    setCardHolderName('');
    setFullName('');
    setPhone('');
    setAddress('');
    setCity('');
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <div className="checkout-modal-header">
          <h2>Checkout</h2>
          <button
            type="button"
            className="checkout-modal-close"
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>

        {successMessage && (
          <div className="checkout-success-message">{successMessage}</div>
        )}

        <div className="checkout-modal-content">
          <div className="checkout-section">
            <h3 className="checkout-section-title">Credit Card</h3>

            <div className="checkout-form-group">
              <label htmlFor="cardNumber" className="checkout-label">
                Card number
              </label>
              <div className="checkout-input-with-brand">
                <input
                  id="cardNumber"
                  type="text"
                  className={`checkout-input ${errors.cardNumber ? 'checkout-input-error' : ''}`}
                  value={cardNumber}
                  onChange={(e) => {
                    const value = digitsOnly(e.target.value, 19);
                    setCardNumber(value);
                    if (errors.cardNumber) {
                      updateFieldError('cardNumber', validateCardNumber, value);
                    }
                  }}
                  onBlur={() =>
                    updateFieldError('cardNumber', validateCardNumber, cardNumber)
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1234 5678 9123 4567"
                />
                {brand !== 'UNKNOWN' && (
                  <span className="checkout-brand-label">{brand}</span>
                )}
              </div>
              {errors.cardNumber && (
                <span className="checkout-error">{errors.cardNumber}</span>
              )}
            </div>

            <div className="checkout-row">
              <div className="checkout-form-group">
                <label htmlFor="expMonth" className="checkout-label">
                  Expiration month
                </label>
                <input
                  id="expMonth"
                  type="text"
                  className={`checkout-input ${errors.expMonth ? 'checkout-input-error' : ''}`}
                  value={expMonth}
                  onChange={(e) => {
                    const value = digitsOnly(e.target.value, 2);
                    setExpMonth(value);
                    if (errors.expMonth) {
                      updateFieldError('expMonth', validateExpMonth, value);
                    }
                  }}
                  onBlur={() =>
                    updateFieldError('expMonth', validateExpMonth, expMonth)
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="MM"
                  maxLength={2}
                />
                {errors.expMonth && (
                  <span className="checkout-error">{errors.expMonth}</span>
                )}
              </div>

              <div className="checkout-form-group">
                <label htmlFor="expYear" className="checkout-label">
                  Expiration year
                </label>
                <input
                  id="expYear"
                  type="text"
                  className={`checkout-input ${errors.expYear ? 'checkout-input-error' : ''}`}
                  value={expYear}
                  onChange={(e) => {
                    const value = digitsOnly(e.target.value, 4);
                    setExpYear(value);
                    if (errors.expYear) {
                      updateFieldError('expYear', validateExpYear, value);
                    }
                  }}
                  onBlur={() =>
                    updateFieldError('expYear', validateExpYear, expYear)
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="YYYY"
                  maxLength={4}
                />
                {errors.expYear && (
                  <span className="checkout-error">{errors.expYear}</span>
                )}
              </div>

              <div className="checkout-form-group">
                <label htmlFor="cvc" className="checkout-label">
                  Security code (CVC)
                </label>
                <input
                  id="cvc"
                  type="text"
                  className={`checkout-input ${errors.cvc ? 'checkout-input-error' : ''}`}
                  value={cvc}
                  onChange={(e) => {
                    const value = digitsOnly(e.target.value, 4);
                    setCvc(value);
                    if (errors.cvc) {
                      updateFieldError('cvc', validateCvc, value);
                    }
                  }}
                  onBlur={() => updateFieldError('cvc', validateCvc, cvc)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="CVC"
                  maxLength={4}
                />
                {errors.cvc && (
                  <span className="checkout-error">{errors.cvc}</span>
                )}
              </div>
            </div>

            <div className="checkout-form-group">
              <label htmlFor="cardHolderName" className="checkout-label">
                Cardholder name
              </label>
              <input
                id="cardHolderName"
                type="text"
                className={`checkout-input ${errors.cardHolderName ? 'checkout-input-error' : ''}`}
                value={cardHolderName}
                onChange={(e) => {
                  const value = lettersOnly(e.target.value);
                  setCardHolderName(value);
                  if (errors.cardHolderName) {
                    updateFieldError('cardHolderName', validateCardHolderName, value);
                  }
                }}
                onBlur={() =>
                  updateFieldError(
                    'cardHolderName',
                    validateCardHolderName,
                    cardHolderName,
                  )
                }
                 placeholder="Juan Pérez García"
              />
              {errors.cardHolderName && (
                <span className="checkout-error">{errors.cardHolderName}</span>
              )}
            </div>
          </div>

          <div className="checkout-section">
            <h3 className="checkout-section-title">Delivery Info</h3>

            <div className="checkout-form-group">
              <label htmlFor="fullName" className="checkout-label">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                className={`checkout-input ${errors.fullName ? 'checkout-input-error' : ''}`}
                value={fullName}
                onChange={(e) => {
                  const value = lettersOnly(e.target.value);
                  setFullName(value);
                  if (errors.fullName) {
                    updateFieldError('fullName', validateFullName, value);
                  }
                }}
                onBlur={() =>
                  updateFieldError('fullName', validateFullName, fullName)
                }
                 placeholder="María García López"
              />
              {errors.fullName && (
                <span className="checkout-error">{errors.fullName}</span>
              )}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="phone" className="checkout-label">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                className={`checkout-input ${errors.phone ? 'checkout-input-error' : ''}`}
                value={phone}
                onChange={(e) => {
                  const value = digitsOnly(e.target.value, 12);
                  setPhone(value);
                  if (errors.phone) {
                    updateFieldError('phone', validatePhone, value);
                  }
                }}
                onBlur={() => updateFieldError('phone', validatePhone, phone)}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="3001234567"
              />
              {errors.phone && (
                <span className="checkout-error">{errors.phone}</span>
              )}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="address" className="checkout-label">
                Street address
              </label>
              <input
                id="address"
                type="text"
                className={`checkout-input ${errors.address ? 'checkout-input-error' : ''}`}
                value={address}
                onChange={(e) => {
                  const value = e.target.value;
                  setAddress(value);
                  if (errors.address) {
                    updateFieldError('address', validateAddress, value);
                  }
                }}
                onBlur={() => updateFieldError('address', validateAddress, address)}
                  placeholder="Cra 5 #45-30 Apto 201"
              />
              {errors.address && (
                <span className="checkout-error">{errors.address}</span>
              )}
            </div>

            <div className="checkout-form-group">
              <label htmlFor="city" className="checkout-label">
                City
              </label>
              <input
                id="city"
                type="text"
                className={`checkout-input ${errors.city ? 'checkout-input-error' : ''}`}
                value={city}
                onChange={(e) => {
                  const value = e.target.value;
                  setCity(value);
                  if (errors.city) {
                    updateFieldError('city', validateCity, value);
                  }
                }}
                onBlur={() => updateFieldError('city', validateCity, city)}
                 placeholder="Bogotá"
              />
              {errors.city && (
                <span className="checkout-error">{errors.city}</span>
              )}
            </div>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button
            type="button"
            className="checkout-button-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="checkout-button-primary"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
