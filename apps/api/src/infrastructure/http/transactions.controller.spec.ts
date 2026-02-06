import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';
import { Ok, Err } from '../../application/use-cases/result';
import { Transaction } from '../../domain/transaction';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let useCase: jest.Mocked<GetTransactionStatusUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: GetTransactionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    useCase = module.get(GetTransactionStatusUseCase);
  });

  it('returns transaction payload on success', async () => {
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

    useCase.execute.mockResolvedValue(Ok({ transaction }));

    const result = await controller.getById('tx-1');

    expect(result).toEqual({
      transactionId: 'tx-1',
      status: 'SUCCESS',
      total: 108000,
      failureReason: undefined,
    });
  });

  it('throws not found when transaction is missing', async () => {
    useCase.execute.mockResolvedValue(Err('TRANSACTION_NOT_FOUND'));

    await expect(controller.getById('tx-missing')).rejects.toThrow(
      'Transaction not found',
    );
  });

  it('throws internal error when repository fails', async () => {
    useCase.execute.mockResolvedValue(Err('DATABASE_ERROR'));

    await expect(controller.getById('tx-1')).rejects.toThrow(
      'Internal server error',
    );
  });
});
