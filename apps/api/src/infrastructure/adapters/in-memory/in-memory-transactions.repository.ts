import { Injectable } from '@nestjs/common';
import {
  TransactionRepositoryError,
  TransactionsRepositoryPort,
} from '../../../application/ports/transactions-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';
import { Transaction } from '../../../domain/transaction';

@Injectable()
export class InMemoryTransactionsRepository
  implements TransactionsRepositoryPort
{
  private transactions = new Map<string, Transaction>();

  async createPending(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    if (this.transactions.has(transaction.id)) {
      return Err('TRANSACTION_ALREADY_EXISTS');
    }
    this.transactions.set(transaction.id, transaction);
    return Ok(transaction);
  }

  async update(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    if (!this.transactions.has(transaction.id)) {
      return Err('TRANSACTION_NOT_FOUND');
    }
    this.transactions.set(transaction.id, transaction);
    return Ok(transaction);
  }

  async getById(
    id: string,
  ): Promise<Result<Transaction | null, TransactionRepositoryError>> {
    const transaction = this.transactions.get(id) || null;
    return Ok(transaction);
  }
}
