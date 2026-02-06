import {
  StockRepositoryError,
  StockRepositoryPort,
} from '../../../application/ports/stock-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';

export class InMemoryStockRepository implements StockRepositoryPort {
  private readonly stockByProductId = new Map<string, number>([
    ['product-1', 12],
  ]);

  async getUnits(productId: string): Promise<number | null> {
    if (!this.stockByProductId.has(productId)) {
      return null;
    }

    return this.stockByProductId.get(productId) ?? null;
  }

  async decrement(
    productId: string,
    by: number,
  ): Promise<Result<void, StockRepositoryError>> {
    const currentUnits = this.stockByProductId.get(productId);

    if (currentUnits === undefined) {
      return Err('PRODUCT_NOT_FOUND');
    }

    if (currentUnits < by) {
      return Err('INSUFFICIENT_STOCK');
    }

    this.stockByProductId.set(productId, currentUnits - by);
    return Ok(undefined);
  }
}
