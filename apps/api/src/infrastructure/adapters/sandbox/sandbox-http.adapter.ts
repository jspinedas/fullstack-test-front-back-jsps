import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentProviderError,
  PaymentProviderPort,
} from '../../../application/ports/payment-provider.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';

@Injectable()
export class SandboxHttpAdapter implements PaymentProviderPort {
  private readonly baseUrl: string;
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly eventsKey: string;
  private readonly integrityKey: string;

  constructor() {
    this.baseUrl =
      process.env.SANDBOX_BASE_URL;
    this.privateKey = process.env.SANDBOX_PRIVATE_KEY || '';
    this.publicKey = process.env.SANDBOX_PUBLIC_KEY || '';
    this.eventsKey = process.env.SANDBOX_EVENTS_KEY || '';
    this.integrityKey = process.env.SANDBOX_INTEGRITY_KEY || '';
  }

  async createCardPayment(
    input: CreatePaymentInput,
  ): Promise<Result<CreatePaymentOutput, PaymentProviderError>> {
    try {
      const tokenResponse = await this.createCardToken(input);
      if (!tokenResponse.ok) {
        return tokenResponse as Result<CreatePaymentOutput, PaymentProviderError>;
      }

      const transactionResponse = await this.createTransaction(
        tokenResponse.value.token,
        input.amount,
        input.currency,
      );
      return transactionResponse;
    } catch (error) {
      return Err('PROVIDER_UNAVAILABLE');
    }
  }

  private async createCardToken(
    input: CreatePaymentInput,
  ): Promise<Result<{ token: string }, PaymentProviderError>> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify({
          number: input.cardNumber,
          cvc: input.cardCvc,
          exp_month: input.cardExpMonth,
          exp_year: String(input.cardExpYear).slice(-2),
          card_holder: input.cardHolder,
        }),
      });

      if (!response.ok) {
        return Err('INVALID_CARD');
      }

      const data = await response.json();
      return Ok({ token: data.data.id });
    } catch (error) {
      return Err('PROVIDER_UNAVAILABLE');
    }
  }

  private async createTransaction(
    token: string,
    amount: number,
    currency: string,
  ): Promise<Result<CreatePaymentOutput, PaymentProviderError>> {
    try {
      const acceptanceToken = await this.getAcceptanceToken();
      const reference = `ref-${Date.now()}`;
      const amountInCents = Math.round(amount * 100);
      const signature = this.createSignature(reference, amountInCents, currency);

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify({
          acceptance_token: acceptanceToken,
          amount_in_cents: amountInCents,
          currency: currency,
          customer_email: 'customer@test.com',
          payment_method: {
            type: 'CARD',
            token: token,
            installments: 1,
          },
          reference: reference,
          signature: signature,
        }),
      });

      if (!response.ok) {
        return Err('CARD_DECLINED');
      }

      const data = await response.json();
      const status = data.data.status;

      if (status === 'APPROVED') {
        return Ok({
          providerTransactionId: data.data.id,
          status: 'SUCCESS',
        });
      } else if (status === 'PENDING') {
        return Ok({
          providerTransactionId: data.data.id,
          status: 'PROCESSING',
        });
      } else {
        return Ok({
          providerTransactionId: data.data.id,
          status: 'FAILED',
          failureReason: data.data.status_message || 'Payment declined',
        });
      }
    } catch (error) {
      return Err('PROVIDER_UNAVAILABLE');
    }
  }

  private async getAcceptanceToken(): Promise<string> {
    try {
      const merchantId = process.env.SANDBOX_PUBLIC_KEY;

      const response = await fetch(
        `${this.baseUrl}/merchants/${merchantId}`,
      );

      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      const token = data.data.presigned_acceptance.acceptance_token;
      return token;
    } catch (error) {
      return '';
    }
  }

  private createSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const payload = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return createHash('sha256').update(payload).digest('hex');
  }
}
