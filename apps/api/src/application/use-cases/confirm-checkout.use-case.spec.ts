import { ConfirmCheckoutUseCase } from './confirm-checkout.use-case';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { PaymentProviderPort } from '../ports/payment-provider.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';
import { DeliveriesRepositoryPort } from '../ports/deliveries-repository.port';
import { Ok, Err } from './result';
import { Transaction } from '../../domain/transaction';
import { Delivery } from '../../domain/delivery';

describe('ConfirmCheckoutUseCase', () => {
  let useCase: ConfirmCheckoutUseCase;
  let transactionsRepository: jest.Mocked<TransactionsRepositoryPort>;
  let paymentProvider: jest.Mocked<PaymentProviderPort>;
  let stockRepository: jest.Mocked<StockRepositoryPort>;
  let deliveriesRepository: jest.Mocked<DeliveriesRepositoryPort>;

  beforeEach(() => {
    transactionsRepository = {
      createPending: jest.fn(),
      update: jest.fn(),
      getById: jest.fn(),
    } as jest.Mocked<TransactionsRepositoryPort>;

    paymentProvider = {
      createCardPayment: jest.fn(),
    } as jest.Mocked<PaymentProviderPort>;

    stockRepository = {
      getUnits: jest.fn(),
      decrement: jest.fn(),
    } as jest.Mocked<StockRepositoryPort>;

    deliveriesRepository = {
      create: jest.fn(),
    } as jest.Mocked<DeliveriesRepositoryPort>;

    useCase = new ConfirmCheckoutUseCase(
      transactionsRepository,
      paymentProvider,
      stockRepository,
      deliveriesRepository,
    );
  });

  it('should successfully confirm checkout when payment succeeds', async () => {
    const transaction: Transaction = {
      id: 'tx-1',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));
    paymentProvider.createCardPayment.mockResolvedValue(
      Ok({
        providerTransactionId: 'provider-tx-1',
        status: 'SUCCESS',
      }),
    );
    stockRepository.decrement.mockResolvedValue(Ok(undefined));
    deliveriesRepository.create.mockImplementation(async (delivery) =>
      Ok(delivery),
    );
    transactionsRepository.update.mockImplementation(async (tx) => Ok(tx));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe('SUCCESS');
      expect(result.value.transaction.providerTransactionId).toBe(
        'provider-tx-1',
      );
    }
    expect(stockRepository.decrement).toHaveBeenCalledWith('product-1', 1);
    expect(deliveriesRepository.create).toHaveBeenCalled();
  });

  it('should fail checkout when payment provider fails', async () => {
    const transaction: Transaction = {
      id: 'tx-1',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));
    paymentProvider.createCardPayment.mockResolvedValue(
      Err('CARD_DECLINED'),
    );
    transactionsRepository.update.mockImplementation(async (tx) => Ok(tx));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe('FAILED');
      expect(result.value.transaction.failureReason).toBe('CARD_DECLINED');
    }
    expect(stockRepository.decrement).not.toHaveBeenCalled();
    expect(deliveriesRepository.create).not.toHaveBeenCalled();
  });

  it('should not process twice if transaction already succeeded (idempotency)', async () => {
    const transaction: Transaction = {
      id: 'tx-1',
      productId: 'product-1',
      status: 'SUCCESS',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      providerTransactionId: 'provider-tx-1',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));

    const result = await useCase.execute({
      transactionId: 'tx-1',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe('SUCCESS');
    }
    expect(paymentProvider.createCardPayment).not.toHaveBeenCalled();
    expect(stockRepository.decrement).not.toHaveBeenCalled();
    expect(deliveriesRepository.create).not.toHaveBeenCalled();
  });

  it('should not process twice if transaction already failed (idempotency)', async () => {
    const transaction: Transaction = {
      id: 'tx-2',
      productId: 'product-1',
      status: 'FAILED',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      failureReason: 'Card declined',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));

    const result = await useCase.execute({
      transactionId: 'tx-2',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe('FAILED');
      expect(result.value.transaction.failureReason).toBe('Card declined');
    }
    expect(paymentProvider.createCardPayment).not.toHaveBeenCalled();
    expect(stockRepository.decrement).not.toHaveBeenCalled();
    expect(deliveriesRepository.create).not.toHaveBeenCalled();
  });

  it('should return database error when transaction lookup fails', async () => {
    transactionsRepository.getById.mockResolvedValue(Err('DATABASE_ERROR'));

    const result = await useCase.execute({
      transactionId: 'tx-db',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result).toEqual({ ok: false, error: 'DATABASE_ERROR' });
    expect(paymentProvider.createCardPayment).not.toHaveBeenCalled();
  });

  it('should mark transaction failed when provider returns FAILED status', async () => {
    const transaction: Transaction = {
      id: 'tx-3',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));
    paymentProvider.createCardPayment.mockResolvedValue(
      Ok({
        providerTransactionId: 'provider-tx-3',
        status: 'FAILED',
        failureReason: 'Card declined',
      }),
    );
    transactionsRepository.update.mockImplementation(async (tx) => Ok(tx));

    const result = await useCase.execute({
      transactionId: 'tx-3',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction.status).toBe('FAILED');
      expect(result.value.transaction.failureReason).toBe('Card declined');
    }
    expect(stockRepository.decrement).not.toHaveBeenCalled();
    expect(deliveriesRepository.create).not.toHaveBeenCalled();
  });

  it('should return insufficient stock when decrement fails', async () => {
    const transaction: Transaction = {
      id: 'tx-4',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    transactionsRepository.getById.mockResolvedValue(Ok(transaction));
    paymentProvider.createCardPayment.mockResolvedValue(
      Ok({
        providerTransactionId: 'provider-tx-4',
        status: 'SUCCESS',
      }),
    );
    stockRepository.decrement.mockResolvedValue(Err('INSUFFICIENT_STOCK'));
    transactionsRepository.update.mockImplementation(async (tx) => Ok(tx));

    const result = await useCase.execute({
      transactionId: 'tx-4',
      paymentData: {
        cardNumber: '4242424242424242',
        cardExpMonth: '12',
        cardExpYear: '25',
        cardCvc: '123',
        cardHolder: 'John Doe',
      },
    });

    expect(result).toEqual({ ok: false, error: 'INSUFFICIENT_STOCK' });
  });
});
