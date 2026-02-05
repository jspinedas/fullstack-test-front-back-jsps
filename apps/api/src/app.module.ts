import { Module } from '@nestjs/common';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { HealthController } from './health/health.controller';
import { InMemoryProductRepository } from './infrastructure/adapters/in-memory/in-memory-product.repository';
import { InMemoryStockRepository } from './infrastructure/adapters/in-memory/in-memory-stock.repository';
import { ProductsController } from './infrastructure/http/products.controller';

@Module({
  imports: [],
  controllers: [HealthController, ProductsController],
  providers: [
    InMemoryProductRepository,
    InMemoryStockRepository,
    {
      provide: GetProductByIdUseCase,
      useFactory: (
        productRepository: InMemoryProductRepository,
        stockRepository: InMemoryStockRepository,
      ) => new GetProductByIdUseCase(productRepository, stockRepository),
      inject: [InMemoryProductRepository, InMemoryStockRepository],
    },
  ],
})
export class AppModule {}
