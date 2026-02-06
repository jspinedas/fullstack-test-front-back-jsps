import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { DynamoDBProductRepository } from './infrastructure/adapters/dynamodb/dynamodb-product.repository';
import { DynamoDBStockRepository } from './infrastructure/adapters/dynamodb/dynamodb-stock.repository';
import { DynamoDBTransactionsRepository } from './infrastructure/adapters/dynamodb/dynamodb-transactions.repository';
import { DynamoDBDeliveriesRepository } from './infrastructure/adapters/dynamodb/dynamodb-deliveries.repository';
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
    {
      provide: 'PRODUCT_REPOSITORY',
      useClass: DynamoDBProductRepository,
    },
    {
      provide: 'STOCK_REPOSITORY',
      useClass: DynamoDBStockRepository,
    },
    {
      provide: 'TRANSACTIONS_REPOSITORY',
      useClass: DynamoDBTransactionsRepository,
    },
    {
      provide: 'DELIVERIES_REPOSITORY',
      useClass: DynamoDBDeliveriesRepository,
    },
    SandboxHttpAdapter,
  ],
})
export class AppModule {}
