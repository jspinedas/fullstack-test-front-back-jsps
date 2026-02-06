import { Injectable } from '@nestjs/common';
import {
  DeliveriesRepositoryPort,
  DeliveryRepositoryError,
} from '../../../application/ports/deliveries-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';
import { Delivery } from '../../../domain/delivery';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDBDeliveriesRepository
  implements DeliveriesRepositoryPort
{
  private dynamodb: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
    this.tableName = process.env.DELIVERIES_TABLE || 'deliveries';
  }

  async create(
    delivery: Delivery,
  ): Promise<Result<Delivery, DeliveryRepositoryError>> {
    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: {
          id: { S: delivery.id },
          transactionId: { S: delivery.transactionId },
          productId: { S: delivery.productId },
          status: { S: delivery.status },
          address: { S: delivery.address },
          city: { S: delivery.city },
          phone: { S: delivery.phone },
          fullName: { S: delivery.fullName },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      });

      await this.dynamodb.send(command);
      return Ok(delivery);
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return Err('DELIVERY_ALREADY_EXISTS');
      }
      console.error('Error creating delivery in DynamoDB:', error);
      return Err('DATABASE_ERROR');
    }
  }
}
