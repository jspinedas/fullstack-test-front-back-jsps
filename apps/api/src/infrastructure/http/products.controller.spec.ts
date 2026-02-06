import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { StockRepositoryPort } from '../../application/ports/stock-repository.port';

describe('ProductsController', () => {
  let controller: ProductsController;
  let executeSpy: jest.SpyInstance;

  beforeEach(async () => {
    const mockProductRepository = {} as ProductRepositoryPort;
    const mockStockRepository = {} as StockRepositoryPort;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: 'PRODUCT_REPOSITORY',
          useValue: mockProductRepository,
        },
        {
          provide: 'STOCK_REPOSITORY',
          useValue: mockStockRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    executeSpy = jest.spyOn(GetProductByIdUseCase.prototype, 'execute');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns product payload on success', async () => {
    const payload = {
      id: 'product-1',
      name: 'Demo Product',
      description: 'Producto de ejemplo',
      price: 20000,
      stock: 10,
    };

    executeSpy.mockResolvedValue({
      ok: true,
      value: payload,
    });

    const result = await controller.getById('product-1');

    expect(result).toEqual(payload);
  });

  it('throws not found when product is missing', async () => {
    executeSpy.mockResolvedValue({
      ok: false,
      error: 'PRODUCT_NOT_FOUND',
    });

    await expect(controller.getById('missing')).rejects.toThrow(
      'Product not found',
    );
  });
});
