import { Product } from '../../domain/product';

export interface ProductRepositoryPort {
  getById(productId: string): Promise<Product | null>;
}
