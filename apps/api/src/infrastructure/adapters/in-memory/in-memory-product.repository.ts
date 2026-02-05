import { Product } from '../../../domain/product';
import { ProductRepositoryPort } from '../../../application/ports/product-repository.port';

export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly products: Product[] = [
    {
      id: 'product-1',
      name: 'Demo Product',
      description: 'Producto de ejemplo para pruebas locales',
      price: 20000,
    },
  ];

  async getById(productId: string): Promise<Product | null> {
    const product = this.products.find((item) => item.id === productId);
    return product ?? null;
  }
}
