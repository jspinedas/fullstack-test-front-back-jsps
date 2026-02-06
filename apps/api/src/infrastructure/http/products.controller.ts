import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';
import { StockRepositoryPort } from '../../application/ports/stock-repository.port';

@Controller('products')
export class ProductsController {
  private getProductByIdUseCase: GetProductByIdUseCase;

  constructor(
    @Inject('PRODUCT_REPOSITORY') private productRepository: ProductRepositoryPort,
    @Inject('STOCK_REPOSITORY') private stockRepository: StockRepositoryPort,
  ) {
    console.log('ProductsController constructor called');
    console.log('productRepository:', !!this.productRepository);
    console.log('stockRepository:', !!this.stockRepository);
    // Instanciar manualmente el use case
    this.getProductByIdUseCase = new GetProductByIdUseCase(
      this.productRepository,
      this.stockRepository,
    );
    console.log('getProductByIdUseCase created:', !!this.getProductByIdUseCase);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    console.log('ProductsController.getById called with id:', id);
    const result = await this.getProductByIdUseCase.execute(id);

    if (!result.ok) {
      throw new NotFoundException({ message: 'Product not found' });
    }

    return result.value;
  }
}
