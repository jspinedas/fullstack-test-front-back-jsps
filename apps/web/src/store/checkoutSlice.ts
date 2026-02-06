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

export interface PaymentMeta {
  brand: CardBrand;
  last4: string | null;
}

export interface DeliveryData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export interface CheckoutState {
  paymentData: PaymentData | null;
  paymentMeta: PaymentMeta | null;
  deliveryData: DeliveryData | null;
  ui: {
    isCheckoutModalOpen: boolean;
  };
}

const getLast4 = (cardNumber: string): string | null => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) {
    return null;
  }
  return digits.slice(-4);
};

const initialState: CheckoutState = {
  paymentData: null,
  paymentMeta: null,
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
      state.paymentMeta = {
        brand: action.payload.paymentData.brand,
        last4: getLast4(action.payload.paymentData.cardNumber),
      };
      state.deliveryData = action.payload.deliveryData;
      state.ui.isCheckoutModalOpen = false;
    },
    rehydrateCheckout: (
      state,
      action: PayloadAction<{
        deliveryData: DeliveryData | null;
        paymentMeta: PaymentMeta | null;
      }>,
    ) => {
      state.paymentData = null;
      state.paymentMeta = action.payload.paymentMeta;
      state.deliveryData = action.payload.deliveryData;
      state.ui.isCheckoutModalOpen = false;
    },
    clearCheckoutData: (state) => {
      state.paymentData = null;
      state.paymentMeta = null;
      state.deliveryData = null;
      state.ui.isCheckoutModalOpen = false;
    },
  },
});

export const {
  openCheckoutModal,
  closeCheckoutModal,
  saveCheckoutData,
  rehydrateCheckout,
  clearCheckoutData,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
