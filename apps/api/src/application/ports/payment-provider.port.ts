import { Result } from '../use-cases/result';

export type PaymentProviderError =
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_CARD'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_DECLINED'
  | 'UNKNOWN_ERROR';

export type CreatePaymentInput = {
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  cardHolder: string;
};

export type CreatePaymentOutput = {
  providerTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  failureReason?: string;
};

export interface PaymentProviderPort {
  createCardPayment(
    input: CreatePaymentInput,
  ): Promise<Result<CreatePaymentOutput, PaymentProviderError>>;
}
