import { Injectable } from '@nestjs/common';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { Product } from '../../../domain/product';
import { ProductRepositoryPort } from '../../../application/ports/product-repository.port';

@Injectable()
export class DynamoDBProductRepository implements ProductRepositoryPort {
  private dynamodb: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
    this.tableName = process.env.PRODUCTS_TABLE || 'products';
  }

  async getById(productId: string): Promise<Product | null> {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: {
          id: { S: productId },
        },
      });

      const response = await this.dynamodb.send(command);

      if (!response.Item) {
        return null;
      }

      return this.mapDynamoDBItemToProduct(response.Item);
    } catch (error) {
      console.error('Error fetching product from DynamoDB:', error);
      throw error;
    }
  }

  private mapDynamoDBItemToProduct(item: Record<string, any>): Product {
    return {
      id: item.id?.S || '',
      name: item.name?.S || '',
      description: item.description?.S || '',
      price: item.price?.N ? parseInt(item.price.N) : 0,
    };
  }
}
