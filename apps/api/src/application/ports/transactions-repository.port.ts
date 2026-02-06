import { Transaction } from '../../domain/transaction';
import { Result } from '../use-cases/result';

export type TransactionRepositoryError =
  | 'TRANSACTION_NOT_FOUND'
  | 'TRANSACTION_ALREADY_EXISTS'
  | 'DATABASE_ERROR';

export interface TransactionsRepositoryPort {
  createPending(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>>;

  update(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>>;

  getById(
    id: string,
  ): Promise<Result<Transaction | null, TransactionRepositoryError>>;
}
