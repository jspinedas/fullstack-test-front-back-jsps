import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { StartCheckoutUseCase } from '../../application/use-cases/start-checkout.use-case';
import { ConfirmCheckoutUseCase } from '../../application/use-cases/confirm-checkout.use-case';
import { Ok, Err } from '../../application/use-cases/result';
import { Transaction } from '../../domain/transaction';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { StockRepositoryPort } from '../../application/ports/stock-repository.port';
import { TransactionsRepositoryPort } from '../../application/ports/transactions-repository.port';
import { DeliveriesRepositoryPort } from '../../application/ports/deliveries-repository.port';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let startCheckoutExecute: jest.SpyInstance;
  let confirmCheckoutExecute: jest.SpyInstance;

  beforeEach(async () => {
    const mockProductRepository = {} as ProductRepositoryPort;
    const mockStockRepository = {} as StockRepositoryPort;
    const mockTransactionsRepository = {} as TransactionsRepositoryPort;
    const mockDeliveriesRepository = {} as DeliveriesRepositoryPort;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: 'PRODUCT_REPOSITORY',
          useValue: mockProductRepository,
        },
        {
          provide: 'STOCK_REPOSITORY',
          useValue: mockStockRepository,
        },
        {
          provide: 'TRANSACTIONS_REPOSITORY',
          useValue: mockTransactionsRepository,
        },
        {
          provide: 'DELIVERIES_REPOSITORY',
          useValue: mockDeliveriesRepository,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    startCheckoutExecute = jest.spyOn(
      StartCheckoutUseCase.prototype,
      'execute',
    );
    confirmCheckoutExecute = jest.spyOn(
      ConfirmCheckoutUseCase.prototype,
      'execute',
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('start', () => {
    it('should return transaction id on success', async () => {
      startCheckoutExecute.mockResolvedValue(
        Ok({ transactionId: 'tx-123' }),
      );

      const result = await controller.start({
        productId: 'product-1',
        deliveryData: {
          fullName: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          city: 'City',
        },
        baseFee: 5000,
        deliveryFee: 3000,
      });

      expect(result.transactionId).toBe('tx-123');
    });

    it('should throw exception on product not found', async () => {
      startCheckoutExecute.mockResolvedValue(
        Err('PRODUCT_NOT_FOUND'),
      );

      await expect(
        controller.start({
          productId: 'product-1',
          deliveryData: {
            fullName: 'John Doe',
            phone: '1234567890',
            address: '123 Main St',
            city: 'City',
          },
          baseFee: 5000,
          deliveryFee: 3000,
        }),
      ).rejects.toThrow('Product not found');
    });

    it('should throw exception on insufficient stock', async () => {
      startCheckoutExecute.mockResolvedValue(
        Err('INSUFFICIENT_STOCK'),
      );

      await expect(
        controller.start({
          productId: 'product-1',
          deliveryData: {
            fullName: 'John Doe',
            phone: '1234567890',
            address: '123 Main St',
            city: 'City',
          },
          baseFee: 5000,
          deliveryFee: 3000,
        }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw exception on database error', async () => {
      startCheckoutExecute.mockResolvedValue(
        Err('DATABASE_ERROR'),
      );

      await expect(
        controller.start({
          productId: 'product-1',
          deliveryData: {
            fullName: 'John Doe',
            phone: '1234567890',
            address: '123 Main St',
            city: 'City',
          },
          baseFee: 5000,
          deliveryFee: 3000,
        }),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('confirm', () => {
    it('should return transaction status on success', async () => {
      const transaction: Transaction = {
        id: 'tx-123',
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

      confirmCheckoutExecute.mockResolvedValue(Ok({ transaction }));

      const result = await controller.confirm({
        transactionId: 'tx-123',
        paymentData: {
          cardNumber: '4242424242424242',
          cardExpMonth: '12',
          cardExpYear: '25',
          cardCvc: '123',
          cardHolder: 'John Doe',
        },
      });

      expect(result.transactionId).toBe('tx-123');
      expect(result.status).toBe('SUCCESS');
      expect(result.message).toBe('Payment successful');
    });

    it('should throw exception on transaction not found', async () => {
      confirmCheckoutExecute.mockResolvedValue(
        Err('TRANSACTION_NOT_FOUND'),
      );

      await expect(
        controller.confirm({
          transactionId: 'tx-123',
          paymentData: {
            cardNumber: '4242424242424242',
            cardExpMonth: '12',
            cardExpYear: '25',
            cardCvc: '123',
            cardHolder: 'John Doe',
          },
        }),
      ).rejects.toThrow('Transaction not found');
    });

    it('should throw exception on insufficient stock', async () => {
      confirmCheckoutExecute.mockResolvedValue(
        Err('INSUFFICIENT_STOCK'),
      );

      await expect(
        controller.confirm({
          transactionId: 'tx-123',
          paymentData: {
            cardNumber: '4242424242424242',
            cardExpMonth: '12',
            cardExpYear: '25',
            cardCvc: '123',
            cardHolder: 'John Doe',
          },
        }),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should throw exception on database error', async () => {
      confirmCheckoutExecute.mockResolvedValue(
        Err('DATABASE_ERROR'),
      );

      await expect(
        controller.confirm({
          transactionId: 'tx-123',
          paymentData: {
            cardNumber: '4242424242424242',
            cardExpMonth: '12',
            cardExpYear: '25',
            cardCvc: '123',
            cardHolder: 'John Doe',
          },
        }),
      ).rejects.toThrow('Internal server error');
    });

    it('should return failed message when payment fails', async () => {
      const transaction: Transaction = {
        id: 'tx-124',
        productId: 'product-1',
        status: 'FAILED',
        amount: 100000,
        baseFee: 5000,
        deliveryFee: 3000,
        total: 108000,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: 'PAYMENT_PROVIDER',
        providerTransactionId: 'provider-tx-2',
        failureReason: 'Card declined',
        customer: {
          fullName: 'John Doe',
          phone: '1234567890',
          address: '123 Main St',
          city: 'City',
        },
      };

      confirmCheckoutExecute.mockResolvedValue(Ok({ transaction }));

      const result = await controller.confirm({
        transactionId: 'tx-124',
        paymentData: {
          cardNumber: '4242424242424242',
          cardExpMonth: '12',
          cardExpYear: '25',
          cardCvc: '123',
          cardHolder: 'John Doe',
        },
      });

      expect(result.status).toBe('FAILED');
      expect(result.message).toBe('Payment failed');
    });
  });
});
