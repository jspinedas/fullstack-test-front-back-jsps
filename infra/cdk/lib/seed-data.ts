import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as custom from 'aws-cdk-lib/custom-resources';

export interface SeedDataProps {
  productsTable: dynamodb.Table;
  stockTable: dynamodb.Table;
}

export class SeedData extends Construct {
  constructor(scope: Construct, id: string, props: SeedDataProps) {
    super(scope, id);

    const seedFunction = new lambda.Function(this, 'SeedFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
        
        const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

        exports.handler = async (event) => {
          console.log('Seeding DynamoDB tables...');
          
          const tableName = process.env.PRODUCTS_TABLE;
          const stockTableName = process.env.STOCK_TABLE;

          try {
            // Check if product already exists
            const getCommand = new GetItemCommand({
              TableName: tableName,
              Key: { id: { S: 'product-1' } }
            });
            
            const existingProduct = await dynamodb.send(getCommand);

            if (existingProduct.Item) {
              console.log('Product already exists, skipping seed');
              return { Status: 'SUCCESS', Message: 'Product already exists' };
            }

            // Insert product
            const putProductCommand = new PutItemCommand({
              TableName: tableName,
              Item: {
                id: { S: 'product-1' },
                name: { S: 'Demo Product' },
                description: { S: 'Example product for testing payment flow' },
                price: { N: '20000' }
              }
            });
            
            await dynamodb.send(putProductCommand);
            console.log('Product inserted');

            // Insert stock
            const putStockCommand = new PutItemCommand({
              TableName: stockTableName,
              Item: {
                productId: { S: 'product-1' },
                units: { N: '100' }
              }
            });
            
            await dynamodb.send(putStockCommand);
            console.log('Stock inserted');

            return { Status: 'SUCCESS', Message: 'Seed data inserted successfully' };
          } catch (error) {
            console.error('Error seeding data:', error);
            throw error;
          }
        };
      `),
      environment: {
        PRODUCTS_TABLE: props.productsTable.tableName,
        STOCK_TABLE: props.stockTable.tableName,
      },
    });

    props.productsTable.grantReadWriteData(seedFunction);
    props.stockTable.grantReadWriteData(seedFunction);

    const customResource = new custom.AwsCustomResource(this, 'SeedDataResource', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: seedFunction.functionName,
          InvocationType: 'RequestResponse',
        },
        physicalResourceId: custom.PhysicalResourceId.of('seed-data'),
      },
      onUpdate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: seedFunction.functionName,
          InvocationType: 'RequestResponse',
        },
        physicalResourceId: custom.PhysicalResourceId.of('seed-data'),
      },
      policy: custom.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [seedFunction.functionArn],
        }),
      ]),
    });

    seedFunction.grantInvoke(new iam.ServicePrincipal('lambda.amazonaws.com'));
  }
}
