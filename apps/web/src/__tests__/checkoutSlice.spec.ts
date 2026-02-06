import checkoutReducer, {
  openCheckoutModal,
  closeCheckoutModal,
  saveCheckoutData,
  rehydrateCheckout,
  clearCheckoutData,
} from '../store/checkoutSlice';
import type { CheckoutState } from '../store/checkoutSlice';

describe('checkoutSlice', () => {
  const initialState: CheckoutState = {
    paymentData: null,
    paymentMeta: null,
    deliveryData: null,
    ui: {
      isCheckoutModalOpen: false,
    },
  };

  describe('openCheckoutModal', () => {
    it('should set isCheckoutModalOpen to true', () => {
      const state = checkoutReducer(initialState, openCheckoutModal());
      expect(state.ui.isCheckoutModalOpen).toBe(true);
    });
  });

  describe('closeCheckoutModal', () => {
    it('should set isCheckoutModalOpen to false', () => {
      const openState: CheckoutState = {
        ...initialState,
        ui: { isCheckoutModalOpen: true },
      };
      const state = checkoutReducer(openState, closeCheckoutModal());
      expect(state.ui.isCheckoutModalOpen).toBe(false);
    });
  });

  describe('saveCheckoutData', () => {
    it('should save payment and delivery data', () => {
      const payload = {
        paymentData: {
          cardNumber: '4111111111111111',
          expMonth: '12',
          expYear: '2025',
          cvc: '123',
          cardHolderName: 'John Doe',
          brand: 'VISA' as const,
        },
        deliveryData: {
          fullName: 'John Doe',
          phone: '5551234567',
          address: '123 Main St',
          city: 'New York',
        },
      };

      const openState: CheckoutState = {
        ...initialState,
        ui: { isCheckoutModalOpen: true },
      };

      const state = checkoutReducer(openState, saveCheckoutData(payload));

      expect(state.paymentData).toEqual(payload.paymentData);
      expect(state.paymentMeta).toEqual({
        brand: 'VISA',
        last4: '1111',
      });
      expect(state.deliveryData).toEqual(payload.deliveryData);
      expect(state.ui.isCheckoutModalOpen).toBe(false);
    });
  });

  describe('rehydrateCheckout', () => {
    it('should rehydrate checkout state with persisted data', () => {
      const payload = {
        deliveryData: {
          fullName: 'John Doe',
          phone: '5551234567',
          address: '123 Main St',
          city: 'New York',
        },
        paymentMeta: {
          brand: 'MASTERCARD' as const,
          last4: '4321',
        },
      };

      const state = checkoutReducer(initialState, rehydrateCheckout(payload));

      expect(state.paymentData).toBeNull();
      expect(state.paymentMeta).toEqual(payload.paymentMeta);
      expect(state.deliveryData).toEqual(payload.deliveryData);
      expect(state.ui.isCheckoutModalOpen).toBe(false);
    });

    it('should handle null paymentMeta', () => {
      const payload = {
        deliveryData: {
          fullName: 'John Doe',
          phone: '5551234567',
          address: '123 Main St',
          city: 'New York',
        },
        paymentMeta: null,
      };

      const state = checkoutReducer(initialState, rehydrateCheckout(payload));

      expect(state.paymentData).toBeNull();
      expect(state.paymentMeta).toBeNull();
      expect(state.deliveryData).toEqual(payload.deliveryData);
      expect(state.ui.isCheckoutModalOpen).toBe(false);
    });
  });

  describe('clearCheckoutData', () => {
    it('should clear all checkout data', () => {
      const filledState: CheckoutState = {
        paymentData: {
          cardNumber: '4111111111111111',
          expMonth: '12',
          expYear: '2025',
          cvc: '123',
          cardHolderName: 'John Doe',
          brand: 'VISA',
        },
        paymentMeta: {
          brand: 'VISA',
          last4: '1111',
        },
        deliveryData: {
          fullName: 'John Doe',
          phone: '5551234567',
          address: '123 Main St',
          city: 'New York',
        },
        ui: { isCheckoutModalOpen: true },
      };

      const state = checkoutReducer(filledState, clearCheckoutData());

      expect(state.paymentData).toBeNull();
      expect(state.paymentMeta).toBeNull();
      expect(state.deliveryData).toBeNull();
      expect(state.ui.isCheckoutModalOpen).toBe(false);
    });
  });
});
