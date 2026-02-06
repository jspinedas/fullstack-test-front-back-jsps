import { Injectable } from '@nestjs/common';
import { GetItemCommand, UpdateItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  StockRepositoryError,
  StockRepositoryPort,
} from '../../../application/ports/stock-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';

@Injectable()
export class DynamoDBStockRepository implements StockRepositoryPort {
  private dynamodb: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
    this.tableName = process.env.STOCK_TABLE || 'stock';
  }

  async getUnits(productId: string): Promise<number | null> {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: {
          productId: { S: productId },
        },
      });

      const response = await this.dynamodb.send(command);

      if (!response.Item) {
        return null;
      }

      return response.Item.units?.N ? parseInt(response.Item.units.N) : null;
    } catch (error) {
      console.error('Error fetching stock from DynamoDB:', error);
      throw error;
    }
  }

  async decrement(
    productId: string,
    by: number,
  ): Promise<Result<void, StockRepositoryError>> {
    try {
      // First check if product exists
      const currentUnits = await this.getUnits(productId);

      if (currentUnits === null) {
        return Err('PRODUCT_NOT_FOUND');
      }

      if (currentUnits < by) {
        return Err('INSUFFICIENT_STOCK');
      }

      // Update the stock
      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: {
          productId: { S: productId },
        },
        UpdateExpression: 'SET units = units - :decrement',
        ExpressionAttributeValues: {
          ':decrement': { N: by.toString() },
        },
      });

      await this.dynamodb.send(command);

      return Ok(undefined);
    } catch (error) {
      console.error('Error decrementing stock in DynamoDB:', error);
      return Err('DATABASE_ERROR');
    }
  }
}
