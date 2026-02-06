import { ProductRepositoryPort } from '../ports/product-repository.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { Err, Ok, Result } from './result';
import { Transaction } from '../../domain/transaction';
import { randomUUID } from 'crypto';

export type StartCheckoutInput = {
  productId: string;
  deliveryInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  baseFee: number;
  deliveryFee: number;
};

export type StartCheckoutOutput = {
  transactionId: string;
};

export type StartCheckoutError =
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'DATABASE_ERROR';

export class StartCheckoutUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly stockRepository: StockRepositoryPort,
    private readonly transactionsRepository: TransactionsRepositoryPort,
  ) {}

  async execute(
    input: StartCheckoutInput,
  ): Promise<Result<StartCheckoutOutput, StartCheckoutError>> {
    const product = await this.productRepository.getById(input.productId);
    if (!product) {
      return Err('PRODUCT_NOT_FOUND');
    }

    const stock = await this.stockRepository.getUnits(input.productId);
    if (stock === null || stock <= 0) {
      return Err('INSUFFICIENT_STOCK');
    }

    const total = product.price + input.baseFee + input.deliveryFee;

    const transaction: Transaction = {
      id: randomUUID(),
      productId: input.productId,
      status: 'PENDING',
      amount: product.price,
      baseFee: input.baseFee,
      deliveryFee: input.deliveryFee,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: input.deliveryInfo,
    };

    const result =
      await this.transactionsRepository.createPending(transaction);

    if (!result.ok) {
      return Err('DATABASE_ERROR');
    }

    return Ok({ transactionId: result.value.id });
  }
}
