import { Product } from '../../domain/product';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';
import { Err, Ok, Result } from './result';

export type ProductWithStock = Product & { stock: number };

export type GetProductByIdError = 'PRODUCT_NOT_FOUND';

export class GetProductByIdUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  async execute(
    productId: string,
  ): Promise<Result<ProductWithStock, GetProductByIdError>> {
    const product = await this.productRepository.getById(productId);
    if (!product) {
      return Err('PRODUCT_NOT_FOUND');
    }

    const units = await this.stockRepository.getUnits(productId);
    if (units === null) {
      return Err('PRODUCT_NOT_FOUND');
    }

    return Ok({ ...product, stock: units });
  }
}
