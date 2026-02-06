import { GetTransactionStatusUseCase } from './get-transaction-status.use-case';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { Ok, Err } from './result';
import { Transaction } from '../../domain/transaction';

describe('GetTransactionStatusUseCase', () => {
  let useCase: GetTransactionStatusUseCase;
  let transactionsRepository: jest.Mocked<TransactionsRepositoryPort>;

  beforeEach(() => {
    transactionsRepository = {
      createPending: jest.fn(),
      update: jest.fn(),
      getById: jest.fn(),
    } as jest.Mocked<TransactionsRepositoryPort>;

    useCase = new GetTransactionStatusUseCase(transactionsRepository);
  });

  it('returns transaction when found', async () => {
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

    const result = await useCase.execute({ transactionId: 'tx-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transaction).toEqual(transaction);
    }
  });

  it('returns not found when transaction is missing', async () => {
    transactionsRepository.getById.mockResolvedValue(Ok(null));

    const result = await useCase.execute({ transactionId: 'missing' });

    expect(result).toEqual({ ok: false, error: 'TRANSACTION_NOT_FOUND' });
  });

  it('returns database error when repository fails', async () => {
    transactionsRepository.getById.mockResolvedValue(Err('DATABASE_ERROR'));

    const result = await useCase.execute({ transactionId: 'tx-1' });

    expect(result).toEqual({ ok: false, error: 'DATABASE_ERROR' });
  });
});
