import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';

describe('GetProductByIdUseCase', () => {
  const product = {
    id: 'product-1',
    name: 'Demo Product',
    description: 'Producto de ejemplo',
    price: 20000,
  };

  it('returns product with stock when found', async () => {
    const productRepository: ProductRepositoryPort = {
      getById: jest.fn().mockResolvedValue(product),
    };
    const stockRepository: StockRepositoryPort = {
      getUnits: jest.fn().mockResolvedValue(10),
      decrement: jest.fn(),
    };

    const useCase = new GetProductByIdUseCase(
      productRepository,
      stockRepository,
    );

    const result = await useCase.execute('product-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ ...product, stock: 10 });
    }
  });

  it('returns not found when product does not exist', async () => {
    const productRepository: ProductRepositoryPort = {
      getById: jest.fn().mockResolvedValue(null),
    };
    const stockRepository: StockRepositoryPort = {
      getUnits: jest.fn().mockResolvedValue(10),
      decrement: jest.fn(),
    };

    const useCase = new GetProductByIdUseCase(
      productRepository,
      stockRepository,
    );

    const result = await useCase.execute('missing');

    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' });
  });
});
