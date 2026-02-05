import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardBrand } from '../utils/cardValidation';

export interface PaymentData {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolderName: string;
  brand: CardBrand;
}

export interface DeliveryData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export interface CheckoutState {
  paymentData: PaymentData | null;
  deliveryData: DeliveryData | null;
  ui: {
    isCheckoutModalOpen: boolean;
  };
}

const initialState: CheckoutState = {
  paymentData: null,
  deliveryData: null,
  ui: {
    isCheckoutModalOpen: false,
  },
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    openCheckoutModal: (state) => {
      state.ui.isCheckoutModalOpen = true;
    },
    closeCheckoutModal: (state) => {
      state.ui.isCheckoutModalOpen = false;
    },
    saveCheckoutData: (
      state,
      action: PayloadAction<{
        paymentData: PaymentData;
        deliveryData: DeliveryData;
      }>,
    ) => {
      state.paymentData = action.payload.paymentData;
      state.deliveryData = action.payload.deliveryData;
      state.ui.isCheckoutModalOpen = false;
    },
    clearCheckoutData: (state) => {
      state.paymentData = null;
      state.deliveryData = null;
      state.ui.isCheckoutModalOpen = false;
    },
  },
});

export const {
  openCheckoutModal,
  closeCheckoutModal,
  saveCheckoutData,
  clearCheckoutData,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
