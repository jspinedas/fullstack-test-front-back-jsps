import { Result } from '../use-cases/result';

export type StockRepositoryError =
  | 'INSUFFICIENT_STOCK'
  | 'PRODUCT_NOT_FOUND'
  | 'DATABASE_ERROR';

export interface StockRepositoryPort {
  getUnits(productId: string): Promise<number | null>;
  decrement(
    productId: string,
    by: number,
  ): Promise<Result<void, StockRepositoryError>>;
}
