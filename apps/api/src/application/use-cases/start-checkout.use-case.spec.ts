import { StartCheckoutUseCase } from './start-checkout.use-case';
import { ProductRepositoryPort } from '../ports/product-repository.port';
import { StockRepositoryPort } from '../ports/stock-repository.port';
import { TransactionsRepositoryPort } from '../ports/transactions-repository.port';
import { Ok } from './result';
import { Product } from '../../domain/product';
import { Transaction } from '../../domain/transaction';

describe('StartCheckoutUseCase', () => {
  let useCase: StartCheckoutUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let stockRepository: jest.Mocked<StockRepositoryPort>;
  let transactionsRepository: jest.Mocked<TransactionsRepositoryPort>;

  beforeEach(() => {
    productRepository = {
      getById: jest.fn(),
    } as jest.Mocked<ProductRepositoryPort>;

    stockRepository = {
      getUnits: jest.fn(),
      decrement: jest.fn(),
    } as jest.Mocked<StockRepositoryPort>;

    transactionsRepository = {
      createPending: jest.fn(),
      update: jest.fn(),
      getById: jest.fn(),
    } as jest.Mocked<TransactionsRepositoryPort>;

    useCase = new StartCheckoutUseCase(
      productRepository,
      stockRepository,
      transactionsRepository,
    );
  });

  it('should create a pending transaction when product exists and stock is available', async () => {
    const product: Product = {
      id: 'product-1',
      name: 'Test Product',
      description: 'Test Description',
      price: 100000,
    };

    productRepository.getById.mockResolvedValue(product);
    stockRepository.getUnits.mockResolvedValue(10);
    transactionsRepository.createPending.mockImplementation(async (tx) =>
      Ok(tx),
    );

    const result = await useCase.execute({
      productId: 'product-1',
      deliveryInfo: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
      baseFee: 5000,
      deliveryFee: 3000,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.transactionId).toBeDefined();
    }
    expect(transactionsRepository.createPending).toHaveBeenCalled();
  });

  it('should return error when product does not exist', async () => {
    productRepository.getById.mockResolvedValue(null);

    const result = await useCase.execute({
      productId: 'product-1',
      deliveryInfo: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
      baseFee: 5000,
      deliveryFee: 3000,
    });

    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' });
  });

  it('should return error when stock is insufficient', async () => {
    const product: Product = {
      id: 'product-1',
      name: 'Test Product',
      description: 'Test Description',
      price: 100000,
    };

    productRepository.getById.mockResolvedValue(product);
    stockRepository.getUnits.mockResolvedValue(0);

    const result = await useCase.execute({
      productId: 'product-1',
      deliveryInfo: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
      baseFee: 5000,
      deliveryFee: 3000,
    });

    expect(result).toEqual({ ok: false, error: 'INSUFFICIENT_STOCK' });
  });

  it('should return error when transaction creation fails', async () => {
    const product: Product = {
      id: 'product-1',
      name: 'Test Product',
      description: 'Test Description',
      price: 100000,
    };

    productRepository.getById.mockResolvedValue(product);
    stockRepository.getUnits.mockResolvedValue(10);
    transactionsRepository.createPending.mockImplementation(async () => ({
      ok: false,
      error: 'DATABASE_ERROR',
    }));

    const result = await useCase.execute({
      productId: 'product-1',
      deliveryInfo: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
      baseFee: 5000,
      deliveryFee: 3000,
    });

    expect(result).toEqual({ ok: false, error: 'DATABASE_ERROR' });
  });
});
