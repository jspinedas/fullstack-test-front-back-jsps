import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import CheckoutModal from '../components/CheckoutModal';
import checkoutReducer from '../store/checkoutSlice';

describe('CheckoutModal', () => {
  const createTestStore = () => {
    const appSlice = createSlice({
      name: 'app',
      initialState: { initialized: true },
      reducers: {},
    });

    const productSlice = createSlice({
      name: 'product',
      initialState: { data: null, status: 'idle', error: null },
      reducers: {},
    });

    return configureStore({
      reducer: {
        app: appSlice.reducer,
        product: productSlice.reducer,
        checkout: checkoutReducer,
      },
    });
  };

  const renderWithStore = (component: React.ReactElement) => {
    const store = createTestStore();
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('should render modal with title', () => {
    renderWithStore(<CheckoutModal />);
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('should render Credit Card and Delivery Info sections', () => {
    renderWithStore(<CheckoutModal />);
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Delivery Info')).toBeInTheDocument();
  });

  it('should render all form inputs', () => {
    renderWithStore(<CheckoutModal />);
    expect(screen.getByLabelText('Card number')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiration month')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiration year')).toBeInTheDocument();
    expect(screen.getByLabelText('Security code (CVC)')).toBeInTheDocument();
    expect(screen.getByLabelText('Cardholder name')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone number')).toBeInTheDocument();
    expect(screen.getByLabelText('Street address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
  });

  it('should render Cancel and Continue buttons', () => {
    renderWithStore(<CheckoutModal />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('should show validation errors when fields are empty', () => {
    renderWithStore(<CheckoutModal />);
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(
      screen.getByText('Card number is required'),
    ).toBeInTheDocument();
    expect(screen.getByText('CVC is required')).toBeInTheDocument();
  });

  it('should show validation error for invalid card number', async () => {
    renderWithStore(<CheckoutModal />);
    const cardInput = screen.getByLabelText('Card number');
    const continueButton = screen.getByText('Continue');

    fireEvent.change(cardInput, { target: { value: '123' } });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(/must be between 13 and 19 digits/),
      ).toBeInTheDocument();
    });
  });

  it('should show VISA brand label for VISA card', () => {
    renderWithStore(<CheckoutModal />);
    const cardInput = screen.getByLabelText('Card number');
    fireEvent.change(cardInput, { target: { value: '4111111111111111' } });

    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('should show MASTERCARD brand label for MC card', () => {
    renderWithStore(<CheckoutModal />);
    const cardInput = screen.getByLabelText('Card number');
    fireEvent.change(cardInput, { target: { value: '5425233010103442' } });

    expect(screen.getByText('MASTERCARD')).toBeInTheDocument();
  });

  it('should not show validation errors when fields are valid', async () => {
    renderWithStore(<CheckoutModal />);

    const cardInput = screen.getByLabelText('Card number');
    const expMonthInput = screen.getByLabelText('Expiration month');
    const expYearInput = screen.getByLabelText('Expiration year');
    const cvcInput = screen.getByLabelText('Security code (CVC)');
    const cardHolderInput = screen.getByLabelText('Cardholder name');
    const fullNameInput = screen.getByLabelText('Full name');
    const phoneInput = screen.getByLabelText('Phone number');
    const addressInput = screen.getByLabelText('Street address');
    const cityInput = screen.getByLabelText('City');

    fireEvent.change(cardInput, { target: { value: '4111111111111111' } });
    fireEvent.change(expMonthInput, { target: { value: '12' } });
    const currentYear = new Date().getFullYear();
    fireEvent.change(expYearInput, {
      target: { value: String(currentYear + 2) },
    });
    fireEvent.change(cvcInput, { target: { value: '123' } });
    fireEvent.change(cardHolderInput, { target: { value: 'Juan Perez' } });
    fireEvent.change(fullNameInput, { target: { value: 'Maria Lopez' } });
    fireEvent.change(phoneInput, { target: { value: '3001234567' } });
    fireEvent.change(addressInput, { target: { value: 'Cra 5 #45-30' } });
    fireEvent.change(cityInput, { target: { value: 'Bogotá' } });

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Datos guardados')).toBeInTheDocument();
    });
  });
});
