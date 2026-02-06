import { Injectable } from '@nestjs/common';
import {
  TransactionRepositoryError,
  TransactionsRepositoryPort,
} from '../../../application/ports/transactions-repository.port';
import { Err, Ok, Result } from '../../../application/use-cases/result';
import { Transaction } from '../../../domain/transaction';
import { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDBTransactionsRepository
  implements TransactionsRepositoryPort
{
  private dynamodb: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' });
    this.tableName = process.env.TRANSACTIONS_TABLE || 'transactions';
  }

  async createPending(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    try {
      // Check if already exists
      const existing = await this.getById(transaction.id);
      if (existing.ok && existing.value !== null) {
        return Err('TRANSACTION_ALREADY_EXISTS');
      }

      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: this.transactionToItem(transaction),
        ConditionExpression: 'attribute_not_exists(id)',
      });

      await this.dynamodb.send(command);
      return Ok(transaction);
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return Err('TRANSACTION_ALREADY_EXISTS');
      }
      console.error('Error creating transaction in DynamoDB:', error);
      return Err('DATABASE_ERROR');
    }
  }

  async update(
    transaction: Transaction,
  ): Promise<Result<Transaction, TransactionRepositoryError>> {
    try {
      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: { id: { S: transaction.id } },
        UpdateExpression: 'SET #s = :status, updatedAt = :updatedAt, #p = :provider, providerTransactionId = :providerTxId, failureReason = :failureReason',
        ExpressionAttributeNames: {
          '#s': 'status',
          '#p': 'provider',
        },
        ExpressionAttributeValues: {
          ':status': { S: transaction.status },
          ':updatedAt': { S: transaction.updatedAt.toISOString() },
          ':provider': { S: transaction.provider },
          ':providerTxId': { S: transaction.providerTransactionId || '' },
          ':failureReason': { S: transaction.failureReason || '' },
        },
      });

      await this.dynamodb.send(command);
      return Ok(transaction);
    } catch (error) {
      console.error('Error updating transaction in DynamoDB:', error);
      return Err('DATABASE_ERROR');
    }
  }

  async getById(
    id: string,
  ): Promise<Result<Transaction | null, TransactionRepositoryError>> {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
      });

      const response = await this.dynamodb.send(command);

      if (!response.Item) {
        return Ok(null);
      }

      return Ok(this.itemToTransaction(response.Item));
    } catch (error) {
      console.error('Error fetching transaction from DynamoDB:', error);
      return Err('DATABASE_ERROR');
    }
  }

  private transactionToItem(transaction: Transaction): Record<string, any> {
    return {
      id: { S: transaction.id },
      productId: { S: transaction.productId },
      status: { S: transaction.status },
      amount: { N: transaction.amount.toString() },
      baseFee: { N: transaction.baseFee.toString() },
      deliveryFee: { N: transaction.deliveryFee.toString() },
      total: { N: transaction.total.toString() },
      createdAt: { S: transaction.createdAt.toISOString() },
      updatedAt: { S: transaction.updatedAt.toISOString() },
      provider: { S: transaction.provider },
      providerTransactionId: { S: transaction.providerTransactionId || '' },
      failureReason: { S: transaction.failureReason || '' },
      'customer.fullName': { S: transaction.customer.fullName },
      'customer.phone': { S: transaction.customer.phone },
      'customer.address': { S: transaction.customer.address },
      'customer.city': { S: transaction.customer.city },
    };
  }

  private itemToTransaction(item: Record<string, any>): Transaction {
    return {
      id: item.id?.S || '',
      productId: item.productId?.S || '',
      status: (item.status?.S || 'PENDING') as 'PENDING' | 'SUCCESS' | 'FAILED',
      amount: item.amount?.N ? parseInt(item.amount.N) : 0,
      baseFee: item.baseFee?.N ? parseInt(item.baseFee.N) : 0,
      deliveryFee: item.deliveryFee?.N ? parseInt(item.deliveryFee.N) : 0,
      total: item.total?.N ? parseInt(item.total.N) : 0,
      createdAt: new Date(item.createdAt?.S || ''),
      updatedAt: new Date(item.updatedAt?.S || ''),
      provider: item.provider?.S || '',
      providerTransactionId: item.providerTransactionId?.S || undefined,
      failureReason: item.failureReason?.S || undefined,
      customer: {
        fullName: item['customer.fullName']?.S || '',
        phone: item['customer.phone']?.S || '',
        address: item['customer.address']?.S || '',
        city: item['customer.city']?.S || '',
      },
    };
  }
}
