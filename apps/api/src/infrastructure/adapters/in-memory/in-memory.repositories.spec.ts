import { InMemoryProductRepository } from './in-memory-product.repository';
import { InMemoryStockRepository } from './in-memory-stock.repository';
import { InMemoryTransactionsRepository } from './in-memory-transactions.repository';
import { InMemoryDeliveriesRepository } from './in-memory-deliveries.repository';
import { Transaction } from '../../../domain/transaction';
import { Delivery } from '../../../domain/delivery';

describe('In-memory repositories', () => {
  it('returns product when found', async () => {
    const repo = new InMemoryProductRepository();
    const product = await repo.getById('product-1');
    expect(product).not.toBeNull();
    expect(product?.id).toBe('product-1');
  });

  it('returns null when product is missing', async () => {
    const repo = new InMemoryProductRepository();
    const product = await repo.getById('missing');
    expect(product).toBeNull();
  });

  it('returns stock units for existing product', async () => {
    const repo = new InMemoryStockRepository();
    const units = await repo.getUnits('product-1');
    expect(units).toBe(12);
  });

  it('returns null for missing stock', async () => {
    const repo = new InMemoryStockRepository();
    const units = await repo.getUnits('missing');
    expect(units).toBeNull();
  });

  it('decrements stock when units are available', async () => {
    const repo = new InMemoryStockRepository();
    const result = await repo.decrement('product-1', 1);
    expect(result.ok).toBe(true);
    const units = await repo.getUnits('product-1');
    expect(units).toBe(11);
  });

  it('returns insufficient stock when decrement exceeds units', async () => {
    const repo = new InMemoryStockRepository();
    const result = await repo.decrement('product-1', 30);
    expect(result).toEqual({ ok: false, error: 'INSUFFICIENT_STOCK' });
  });

  it('returns product not found when decrementing missing product', async () => {
    const repo = new InMemoryStockRepository();
    const result = await repo.decrement('missing', 1);
    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' });
  });

  it('creates and returns transaction', async () => {
    const repo = new InMemoryTransactionsRepository();
    const transaction: Transaction = {
      id: 'tx-1',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    const createResult = await repo.createPending(transaction);
    expect(createResult.ok).toBe(true);

    const getResult = await repo.getById('tx-1');
    expect(getResult.ok).toBe(true);
    if (getResult.ok) {
      expect(getResult.value?.id).toBe('tx-1');
    }
  });

  it('returns error when transaction already exists', async () => {
    const repo = new InMemoryTransactionsRepository();
    const transaction: Transaction = {
      id: 'tx-2',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    await repo.createPending(transaction);
    const result = await repo.createPending(transaction);
    expect(result).toEqual({ ok: false, error: 'TRANSACTION_ALREADY_EXISTS' });
  });

  it('updates transaction when found', async () => {
    const repo = new InMemoryTransactionsRepository();
    const transaction: Transaction = {
      id: 'tx-3',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    await repo.createPending(transaction);

    const updated = { ...transaction, status: 'SUCCESS' as const };
    const result = await repo.update(updated);
    expect(result.ok).toBe(true);
  });

  it('returns error when updating missing transaction', async () => {
    const repo = new InMemoryTransactionsRepository();
    const transaction: Transaction = {
      id: 'missing',
      productId: 'product-1',
      status: 'PENDING',
      amount: 100000,
      baseFee: 5000,
      deliveryFee: 3000,
      total: 108000,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'PAYMENT_PROVIDER',
      customer: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'City',
      },
    };

    const result = await repo.update(transaction);
    expect(result).toEqual({ ok: false, error: 'TRANSACTION_NOT_FOUND' });
  });

  it('creates delivery when not existing', async () => {
    const repo = new InMemoryDeliveriesRepository();
    const delivery: Delivery = {
      id: 'del-1',
      transactionId: 'tx-1',
      productId: 'product-1',
      status: 'CREATED',
      address: '123 Main St',
      city: 'City',
      phone: '1234567890',
      fullName: 'John Doe',
    };

    const result = await repo.create(delivery);
    expect(result.ok).toBe(true);
  });

  it('returns error when delivery already exists', async () => {
    const repo = new InMemoryDeliveriesRepository();
    const delivery: Delivery = {
      id: 'del-2',
      transactionId: 'tx-2',
      productId: 'product-1',
      status: 'CREATED',
      address: '123 Main St',
      city: 'City',
      phone: '1234567890',
      fullName: 'John Doe',
    };

    await repo.create(delivery);
    const result = await repo.create(delivery);
    expect(result).toEqual({ ok: false, error: 'DELIVERY_ALREADY_EXISTS' });
  });
});
