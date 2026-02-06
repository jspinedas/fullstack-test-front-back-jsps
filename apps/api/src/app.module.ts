import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { StartCheckoutUseCase } from './application/use-cases/start-checkout.use-case';
import { ConfirmCheckoutUseCase } from './application/use-cases/confirm-checkout.use-case';
import { GetTransactionStatusUseCase } from './application/use-cases/get-transaction-status.use-case';
import { HealthController } from './health/health.controller';
import { InMemoryProductRepository } from './infrastructure/adapters/in-memory/in-memory-product.repository';
import { InMemoryStockRepository } from './infrastructure/adapters/in-memory/in-memory-stock.repository';
import { InMemoryTransactionsRepository } from './infrastructure/adapters/in-memory/in-memory-transactions.repository';
import { InMemoryDeliveriesRepository } from './infrastructure/adapters/in-memory/in-memory-deliveries.repository';
import { SandboxHttpAdapter } from './infrastructure/adapters/sandbox/sandbox-http.adapter';
import { ProductsController } from './infrastructure/http/products.controller';
import { CheckoutController } from './infrastructure/http/checkout.controller';
import { TransactionsController } from './infrastructure/http/transactions.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [
    HealthController,
    ProductsController,
    CheckoutController,
    TransactionsController,
  ],
  providers: [
    InMemoryProductRepository,
    InMemoryStockRepository,
    InMemoryTransactionsRepository,
    InMemoryDeliveriesRepository,
    SandboxHttpAdapter,
    {
      provide: GetProductByIdUseCase,
      useFactory: (
        productRepository: InMemoryProductRepository,
        stockRepository: InMemoryStockRepository,
      ) => new GetProductByIdUseCase(productRepository, stockRepository),
      inject: [InMemoryProductRepository, InMemoryStockRepository],
    },
    {
      provide: StartCheckoutUseCase,
      useFactory: (
        productRepository: InMemoryProductRepository,
        stockRepository: InMemoryStockRepository,
        transactionsRepository: InMemoryTransactionsRepository,
      ) =>
        new StartCheckoutUseCase(
          productRepository,
          stockRepository,
          transactionsRepository,
        ),
      inject: [
        InMemoryProductRepository,
        InMemoryStockRepository,
        InMemoryTransactionsRepository,
      ],
    },
    {
      provide: ConfirmCheckoutUseCase,
      useFactory: (
        transactionsRepository: InMemoryTransactionsRepository,
        paymentProvider: SandboxHttpAdapter,
        stockRepository: InMemoryStockRepository,
        deliveriesRepository: InMemoryDeliveriesRepository,
      ) =>
        new ConfirmCheckoutUseCase(
          transactionsRepository,
          paymentProvider,
          stockRepository,
          deliveriesRepository,
        ),
      inject: [
        InMemoryTransactionsRepository,
        SandboxHttpAdapter,
        InMemoryStockRepository,
        InMemoryDeliveriesRepository,
      ],
    },
    {
      provide: GetTransactionStatusUseCase,
      useFactory: (
        transactionsRepository: InMemoryTransactionsRepository,
      ) => new GetTransactionStatusUseCase(transactionsRepository),
      inject: [InMemoryTransactionsRepository],
    },
  ],
})
export class AppModule {}
