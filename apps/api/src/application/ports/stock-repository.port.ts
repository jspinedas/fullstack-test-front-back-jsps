export interface StockRepositoryPort {
  getUnits(productId: string): Promise<number | null>;
}
