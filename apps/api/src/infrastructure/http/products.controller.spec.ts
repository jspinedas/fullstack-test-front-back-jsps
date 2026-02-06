import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';

describe('ProductsController', () => {
  let controller: ProductsController;
  let useCase: GetProductByIdUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: GetProductByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
  });

  it('returns product payload on success', async () => {
    const payload = {
      id: 'product-1',
      name: 'Demo Product',
      description: 'Producto de ejemplo',
      price: 20000,
      stock: 10,
    };

    jest.spyOn(useCase, 'execute').mockResolvedValue({
      ok: true,
      value: payload,
    });

    const result = await controller.getById('product-1');

    expect(result).toEqual(payload);
  });

  it('throws not found when product is missing', async () => {
    jest.spyOn(useCase, 'execute').mockResolvedValue({
      ok: false,
      error: 'PRODUCT_NOT_FOUND',
    });

    await expect(controller.getById('missing')).rejects.toThrow(
      'Product not found',
    );
  });
});
