import { PaymentProviderPort } from '../ports/payment-provider.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { DeliveriesRepositoryPort } from '../ports/deliveries-repository.port';
import { Err, Ok, Result } from './result';
import { Transaction } from '../../domain/transaction';
import { Delivery } from '../../domain/delivery';
import { randomUUID } from 'crypto';

export type ConfirmCheckoutInput = {
  transactionId: string;
  paymentData: {
    cardNumber: string;
    cardExpMonth: string;
    cardExpYear: string;
    cardCvc: string;
    cardHolder: string;
  };
};

export type ConfirmCheckoutOutput = {
  transaction: Transaction;
};

export type ConfirmCheckoutError =
  | 'TRANSACTION_NOT_FOUND'
  | 'PAYMENT_FAILED'
  | 'INSUFFICIENT_STOCK'
  | 'DATABASE_ERROR';

export class ConfirmCheckoutUseCase {
  constructor(
    private readonly transactionsRepository: TransactionsRepositoryPort,
    private readonly paymentProvider: PaymentProviderPort,
    private readonly stockRepository: StockRepositoryPort,
    private readonly deliveriesRepository: DeliveriesRepositoryPort,
  ) {}

  async execute(
    input: ConfirmCheckoutInput,
  ): Promise<Result<ConfirmCheckoutOutput, ConfirmCheckoutError>> {
    const transactionResult = await this.transactionsRepository.getById(
      input.transactionId,
    );
    if (!transactionResult.ok) {
      return Err('DATABASE_ERROR');
    }

    const transaction = transactionResult.value;
    if (!transaction) {
      return Err('TRANSACTION_NOT_FOUND');
    }

    if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
      return Ok({ transaction });
    }

    const paymentResult = await this.paymentProvider.createCardPayment({
      amount: transaction.total,
      currency: 'COP',
      cardNumber: input.paymentData.cardNumber,
      cardExpMonth: input.paymentData.cardExpMonth,
      cardExpYear: input.paymentData.cardExpYear,
      cardCvc: input.paymentData.cardCvc,
      cardHolder: input.paymentData.cardHolder,
    });

    if (!paymentResult.ok) {
      transaction.status = 'FAILED';
      transaction.failureReason = (paymentResult as { ok: false; error: string }).error;
      transaction.updatedAt = new Date();
      await this.transactionsRepository.update(transaction);
      return Ok({ transaction });
    }

    const paymentResponse = paymentResult.value;

    if (paymentResponse.status === 'FAILED') {
      transaction.status = 'FAILED';
      transaction.providerTransactionId = paymentResponse.providerTransactionId;
      transaction.failureReason = paymentResponse.failureReason;
      transaction.updatedAt = new Date();
      await this.transactionsRepository.update(transaction);
      return Ok({ transaction });
    }

    const stockResult = await this.stockRepository.decrement(
      transaction.productId,
      1,
    );
    if (!stockResult.ok) {
      transaction.status = 'FAILED';
      transaction.failureReason = 'Stock decrement failed';
      transaction.updatedAt = new Date();
      await this.transactionsRepository.update(transaction);
      return Err('INSUFFICIENT_STOCK');
    }

    const delivery: Delivery = {
      id: randomUUID(),
      transactionId: transaction.id,
      productId: transaction.productId,
      status: 'CREATED',
      address: transaction.customer.address,
      city: transaction.customer.city,
      phone: transaction.customer.phone,
      fullName: transaction.customer.fullName,
    };

    const deliveryResult = await this.deliveriesRepository.create(delivery);
    if (!deliveryResult.ok) {
      return Err('DATABASE_ERROR');
    }

    transaction.status = 'SUCCESS';
    transaction.providerTransactionId = paymentResponse.providerTransactionId;
    transaction.updatedAt = new Date();

    const updateResult =
      await this.transactionsRepository.update(transaction);
    if (!updateResult.ok) {
      return Err('DATABASE_ERROR');
    }

    return Ok({ transaction: updateResult.value });
  }
}
