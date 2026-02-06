import {
  savePersistedState,
  loadPersistedState,
  clearPersistedState,
} from '../utils/persistedState';

const STORAGE_KEY = 'checkout_state';

describe('persistedState utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('savePersistedState', () => {
    it('should save state to localStorage', () => {
      const state = {
        product: { data: { id: 'product-1' } },
        checkout: {
          deliveryData: {
            fullName: 'John Doe',
            phone: '3001234567',
            address: '123 Main St',
            city: 'Bogotá',
          },
          paymentData: null,
          paymentMeta: {
            brand: 'VISA' as const,
            last4: '1234',
          },
        },
        paymentFlow: { step: 'summary' as const, transactionId: null },
        transactionStatus: { status: null },
      };

      savePersistedState(state);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(1);
      expect(parsed.checkoutStep).toBe('summary');
      expect(parsed.productId).toBe('product-1');
      expect(parsed.deliveryData).toEqual(state.checkout.deliveryData);
      expect(parsed.paymentMeta).toEqual({
        brand: 'VISA',
        last4: '1234',
      });
    });

    it('should extract last4 from paymentData if paymentMeta is null', () => {
      const state = {
        product: { data: { id: 'product-1' } },
        checkout: {
          deliveryData: {
            fullName: 'John Doe',
            phone: '3001234567',
            address: '123 Main St',
            city: 'Bogotá',
          },
          paymentData: {
            cardNumber: '4111111111111111',
            expMonth: '12',
            expYear: '2026',
            cvc: '123',
            cardHolderName: 'John Doe',
            brand: 'VISA' as const,
          },
          paymentMeta: null,
        },
        paymentFlow: { step: 'summary' as const, transactionId: null },
        transactionStatus: { status: null },
      };

      savePersistedState(state);

      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw!);
      expect(parsed.paymentMeta).toEqual({
        brand: 'VISA',
        last4: '1111',
      });
    });

    it('should NOT save cardNumber or cvc', () => {
      const state = {
        product: { data: { id: 'product-1' } },
        checkout: {
          deliveryData: {
            fullName: 'John Doe',
            phone: '9998887777',
            address: '456 Oak Ave',
            city: 'Miami',
          },
          paymentData: {
            cardNumber: '4111111111111111',
            expMonth: '12',
            expYear: '2026',
            cvc: '555',
            cardHolderName: 'John Doe',
            brand: 'VISA' as const,
          },
          paymentMeta: null,
        },
        paymentFlow: { step: 'summary' as const, transactionId: null },
        transactionStatus: { status: null },
      };

      savePersistedState(state);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toContain('4111111111111111');
      expect(raw).not.toContain('555');
      expect(raw).toContain('1111');
    });

    it('should clear persisted state when transaction is SUCCESS', () => {
      const state = {
        product: { data: { id: 'product-1' } },
        checkout: {
          deliveryData: null,
          paymentData: null,
          paymentMeta: null,
        },
        paymentFlow: { step: 'final' as const, transactionId: 'tx-123' },
        transactionStatus: { status: 'SUCCESS' as const },
      };

      savePersistedState(state);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeNull();
    });

    it('should clear persisted state when transaction is FAILED', () => {
      const state = {
        product: { data: { id: 'product-1' } },
        checkout: {
          deliveryData: null,
          paymentData: null,
          paymentMeta: null,
        },
        paymentFlow: { step: 'final' as const, transactionId: 'tx-123' },
        transactionStatus: { status: 'FAILED' as const },
      };

      savePersistedState(state);

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeNull();
    });
  });

  describe('loadPersistedState', () => {
    it('should load persisted state from localStorage', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'summary',
        productId: 'product-1',
        transactionId: null,
        deliveryData: {
          fullName: 'John Doe',
          phone: '3001234567',
          address: '123 Main St',
          city: 'Bogotá',
        },
        paymentMeta: {
          brand: 'VISA',
          last4: '1234',
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      const loaded = loadPersistedState();
      expect(loaded).toEqual(persisted);
    });

    it('should return null if no persisted state exists', () => {
      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
    });

    it('should clear and return null if version does not match', () => {
      const persisted = {
        version: 2,
        checkoutStep: 'summary',
        productId: 'product-1',
        transactionId: null,
        deliveryData: null,
        paymentMeta: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should clear and return null if checkoutStep is invalid', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'invalid',
        productId: 'product-1',
        transactionId: null,
        deliveryData: null,
        paymentMeta: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should clear and return null if summary step is missing required data', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'summary',
        productId: null,
        transactionId: null,
        deliveryData: null,
        paymentMeta: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should clear and return null if final step is missing transactionId', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'final',
        productId: 'product-1',
        transactionId: null,
        deliveryData: null,
        paymentMeta: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem(STORAGE_KEY, '{invalid json');

      const loaded = loadPersistedState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('clearPersistedState', () => {
    it('should remove persisted state from localStorage', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'summary',
        productId: 'product-1',
        transactionId: null,
        deliveryData: null,
        paymentMeta: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      clearPersistedState();

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeNull();
    });

    it('should keep productId when keepProductId option is provided', () => {
      const persisted = {
        version: 1,
        checkoutStep: 'summary',
        productId: 'product-1',
        transactionId: 'tx-123',
        deliveryData: {
          fullName: 'John Doe',
          phone: '3001234567',
          address: '123 Main St',
          city: 'Bogotá',
        },
        paymentMeta: {
          brand: 'VISA',
          last4: '1234',
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));

      clearPersistedState({ keepProductId: 'product-1' });

      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.checkoutStep).toBe('product');
      expect(parsed.productId).toBe('product-1');
      expect(parsed.transactionId).toBeNull();
      expect(parsed.deliveryData).toBeNull();
      expect(parsed.paymentMeta).toBeNull();
    });
  });
});
