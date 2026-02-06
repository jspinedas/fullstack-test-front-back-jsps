import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { Err, Ok, Result } from './result';
import { Transaction } from '../../domain/transaction';

export type GetTransactionStatusInput = {
  transactionId: string;
};

export type GetTransactionStatusOutput = {
  transaction: Transaction;
};

export type GetTransactionStatusError =
  | 'TRANSACTION_NOT_FOUND'
  | 'DATABASE_ERROR';

export class GetTransactionStatusUseCase {
  constructor(
    private readonly transactionsRepository: TransactionsRepositoryPort,
  ) {}

  async execute(
    input: GetTransactionStatusInput,
  ): Promise<Result<GetTransactionStatusOutput, GetTransactionStatusError>> {
    const result = await this.transactionsRepository.getById(
      input.transactionId,
    );

    if (!result.ok) {
      return Err('DATABASE_ERROR');
    }

    if (!result.value) {
      return Err('TRANSACTION_NOT_FOUND');
    }

    return Ok({ transaction: result.value });
  }
}
