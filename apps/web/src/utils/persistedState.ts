import type { PaymentStep } from '../store/paymentFlowSlice';
import type {
  DeliveryData,
  PaymentData,
  PaymentMeta,
} from '../store/checkoutSlice';
import type { TransactionStatus } from '../store/transactionStatusSlice';

export type PersistedState = {
  version: 1;
  checkoutStep: PaymentStep;
  productId: string | null;
  transactionId: string | null;
  deliveryData: DeliveryData | null;
  paymentMeta: PaymentMeta | null;
};

type PersistedStateInput = {
  product?: { data: { id: string } | null } | null;
  checkout?: {
    deliveryData: DeliveryData | null;
    paymentData: PaymentData | null;
    paymentMeta?: PaymentMeta | null;
  } | null;
  paymentFlow?: { step: PaymentStep; transactionId: string | null } | null;
  transactionStatus?: { status: TransactionStatus | null } | null;
};

const STORAGE_KEY = 'checkout_state';
const VERSION: PersistedState['version'] = 1;

const storageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getLast4 = (cardNumber: string): string | null => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) {
    return null;
  }
  return digits.slice(-4);
};

const normalizePaymentMeta = (
  paymentData: PaymentData | null,
  paymentMeta: PaymentMeta | null,
): PaymentMeta | null => {
  if (paymentMeta) {
    return paymentMeta;
  }
  if (!paymentData) {
    return null;
  }
  return {
    brand: paymentData.brand,
    last4: getLast4(paymentData.cardNumber),
  };
};

const buildPersistedState = (input: PersistedStateInput): PersistedState => {
  const step = input.paymentFlow?.step ?? 'product';
  const transactionId = input.paymentFlow?.transactionId ?? null;
  const productId = input.product?.data?.id ?? null;
  const deliveryData = input.checkout?.deliveryData ?? null;
  const paymentMeta = normalizePaymentMeta(
    input.checkout?.paymentData ?? null,
    input.checkout?.paymentMeta ?? null,
  );

  return {
    version: VERSION,
    checkoutStep: step,
    productId,
    transactionId,
    deliveryData,
    paymentMeta,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const isPaymentStep = (value: unknown): value is PaymentStep =>
  value === 'product' ||
  value === 'checkout' ||
  value === 'summary' ||
  value === 'final';

const isDeliveryData = (value: unknown): value is DeliveryData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.fullName) &&
    isString(value.phone) &&
    isString(value.address) &&
    isString(value.city)
  );
};

const isPaymentMeta = (value: unknown): value is PaymentMeta => {
  if (!isRecord(value)) {
    return false;
  }

  if (!isString(value.brand)) {
    return false;
  }

  if (
    value.brand !== 'VISA' &&
    value.brand !== 'MASTERCARD' &&
    value.brand !== 'UNKNOWN'
  ) {
    return false;
  }

  if (value.last4 === null) {
    return true;
  }

  if (!isString(value.last4)) {
    return false;
  }

  return /^\d{4}$/.test(value.last4);
};

export const savePersistedState = (state: PersistedStateInput): void => {
  if (!storageAvailable()) {
    return;
  }

  const status = state.transactionStatus?.status ?? null;
  if (status === 'SUCCESS' || status === 'FAILED') {
    clearPersistedState();
    return;
  }

  const persisted = buildPersistedState(state);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
};

export const loadPersistedState = (): PersistedState | null => {
  if (!storageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      clearPersistedState();
      return null;
    }

    if (parsed.version !== VERSION) {
      clearPersistedState();
      return null;
    }

    if (!isPaymentStep(parsed.checkoutStep)) {
      clearPersistedState();
      return null;
    }

    const productId = isString(parsed.productId) ? parsed.productId : null;
    const transactionId = isString(parsed.transactionId)
      ? parsed.transactionId
      : null;
    const deliveryData = isDeliveryData(parsed.deliveryData)
      ? parsed.deliveryData
      : null;
    const paymentMeta = isPaymentMeta(parsed.paymentMeta)
      ? parsed.paymentMeta
      : null;

    if (parsed.checkoutStep === 'summary' && (!productId || !deliveryData)) {
      clearPersistedState();
      return null;
    }

    if (parsed.checkoutStep === 'final' && !transactionId) {
      clearPersistedState();
      return null;
    }

    if (parsed.checkoutStep === 'checkout' && !productId) {
      clearPersistedState();
      return null;
    }

    return {
      version: VERSION,
      checkoutStep: parsed.checkoutStep,
      productId,
      transactionId,
      deliveryData,
      paymentMeta,
    };
  } catch {
    clearPersistedState();
    return null;
  }
};

export const clearPersistedState = (options?: {
  keepProductId?: string | null;
}): void => {
  if (!storageAvailable()) {
    return;
  }

  if (options?.keepProductId) {
    const persisted: PersistedState = {
      version: VERSION,
      checkoutStep: 'product',
      productId: options.keepProductId,
      transactionId: null,
      deliveryData: null,
      paymentMeta: null,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
