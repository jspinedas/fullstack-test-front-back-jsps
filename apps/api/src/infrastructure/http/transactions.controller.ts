import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.getTransactionStatusUseCase.execute({
      transactionId: id,
    });

    if (!result.ok) {
      const error = (result as { ok: false; error: string }).error;
      if (error === 'TRANSACTION_NOT_FOUND') {
        throw new HttpException(
          'Transaction not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const tx = result.value.transaction;
    return {
      transactionId: tx.id,
      status: tx.status,
      total: tx.total,
      failureReason: tx.failureReason,
    };
  }
}
