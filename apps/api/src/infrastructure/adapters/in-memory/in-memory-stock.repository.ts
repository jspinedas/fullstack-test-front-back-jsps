import { StockRepositoryPort } from '../../../application/ports/stock-repository.port';

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
}
