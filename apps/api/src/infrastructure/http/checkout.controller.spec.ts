import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { StartCheckoutUseCase } from '../../application/use-cases/start-checkout.use-case';
import { ConfirmCheckoutUseCase } from '../../application/use-cases/confirm-checkout.use-case';
import { Ok, Err } from '../../application/use-cases/result';
import { Transaction } from '../../domain/transaction';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let startCheckoutUseCase: jest.Mocked<StartCheckoutUseCase>;
  let confirmCheckoutUseCase: jest.Mocked<ConfirmCheckoutUseCase>;

  beforeEach(async () => {
    const mockStartCheckoutUseCase = {
      execute: jest.fn(),
    };

    const mockConfirmCheckoutUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: StartCheckoutUseCase,
          useValue: mockStartCheckoutUseCase,
        },
        {
          provide: ConfirmCheckoutUseCase,
          useValue: mockConfirmCheckoutUseCase,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    startCheckoutUseCase = module.get(StartCheckoutUseCase);
    confirmCheckoutUseCase = module.get(ConfirmCheckoutUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('start', () => {
    it('should return transaction id on success', async () => {
      startCheckoutUseCase.execute.mockResolvedValue(
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
      startCheckoutUseCase.execute.mockResolvedValue(
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

      confirmCheckoutUseCase.execute.mockResolvedValue(Ok({ transaction }));

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
      confirmCheckoutUseCase.execute.mockResolvedValue(
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
  });
});
