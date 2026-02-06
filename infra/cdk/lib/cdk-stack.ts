import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayintegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as fs from 'fs';
import * as custom from 'aws-cdk-lib/custom-resources';
import { SeedData } from './seed-data';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = 'fullstack-test';
    const environment = 'dev';

    // ==================== S3 Bucket for Frontend ====================
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `${appName}-frontend-${this.account}-${this.region}`,
      versioned: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ==================== CloudFront Distribution ====================
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'FrontendOAI',
      {
        comment: `OAI for ${appName} frontend`,
      }
    );

    const distribution = new cloudfront.Distribution(
      this,
      'FrontendDistribution',
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: new origins.S3Origin(frontendBucket, {
            originAccessIdentity: originAccessIdentity,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5),
          },
        ],
      }
    );

    // Grant CloudFront to read from S3 (handled automatically by S3Origin)
    frontendBucket.grantRead(originAccessIdentity);

    // ==================== DynamoDB Tables ====================
    const transactionsTable = new dynamodb.Table(
      this,
      'TransactionsTable',
      {
        tableName: 'transactions',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        timeToLiveAttribute: 'ttl',
      }
    );

    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const stockTable = new dynamodb.Table(this, 'StockTable', {
      tableName: 'stock',
      partitionKey: {
        name: 'productId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const deliveriesTable = new dynamodb.Table(
      this,
      'DeliveriesTable',
      {
        tableName: 'deliveries',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    // ==================== Seed Initial Data ====================
    new SeedData(this, 'SeedData', {
      productsTable,
      stockTable,
    });

    // ==================== SSM Parameter Store ====================
    // Create placeholder parameters (set real values manually with aws ssm put-parameter)
    new ssm.StringParameter(this, 'SandboxBaseUrlParam', {
      parameterName: `/${appName}/sandbox/baseUrl`,
      stringValue: 'PLACEHOLDER_SET_MANUALLY',
      description: 'Sandbox payment provider base URL',
    });

    new ssm.StringParameter(this, 'SandboxPrivateKeyParam', {
      parameterName: `/${appName}/sandbox/privateKey`,
      stringValue: 'PLACEHOLDER_SET_MANUALLY',
      description: 'Sandbox payment provider private key',
    });

    new ssm.StringParameter(this, 'SandboxPublicKeyParam', {
      parameterName: `/${appName}/sandbox/publicKey`,
      stringValue: 'PLACEHOLDER_SET_MANUALLY',
      description: 'Sandbox payment provider public key',
    });

    new ssm.StringParameter(this, 'SandboxIntegrityKeyParam', {
      parameterName: `/${appName}/sandbox/integrityKey`,
      stringValue: 'PLACEHOLDER_SET_MANUALLY',
      description: 'Sandbox payment provider integrity key',
    });

    new ssm.StringParameter(this, 'SandboxEventsKeyParam', {
      parameterName: `/${appName}/sandbox/eventsKey`,
      stringValue: 'PLACEHOLDER_SET_MANUALLY',
      description: 'Sandbox payment provider events key',
    });

    // ==================== Lambda Function ====================
    const lambdaExecutionRole = new iam.Role(
      this,
      'LambdaExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole'
          ),
        ],
      }
    );

    // Grant DynamoDB access
    transactionsTable.grantReadWriteData(lambdaExecutionRole);
    productsTable.grantReadWriteData(lambdaExecutionRole);
    stockTable.grantReadWriteData(lambdaExecutionRole);
    deliveriesTable.grantReadWriteData(lambdaExecutionRole);

    // Grant SSM access
    lambdaExecutionRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/${appName}/sandbox/*`,
        ],
      })
    );

    const lambdaFunction = new nodejs.NodejsFunction(this, 'BackendLambda', {
      functionName: `${appName}-api`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../..', 'apps/api/src/lambda-handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: lambdaExecutionRole,
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: [
          'aws-sdk',
          '@nestjs/websockets',
          '@nestjs/microservices',
          'class-transformer',
          'class-validator',
        ],
      },
      environment: {
        TABLE_TRANSACTIONS: transactionsTable.tableName,
        TABLE_PRODUCTS: productsTable.tableName,
        TABLE_STOCK: stockTable.tableName,
        TABLE_DELIVERIES: deliveriesTable.tableName,
        SANDBOX_BASE_URL: `/${appName}/sandbox/baseUrl`,
        SANDBOX_PRIVATE_KEY: `/${appName}/sandbox/privateKey`,
        SANDBOX_PUBLIC_KEY: `/${appName}/sandbox/publicKey`,
        SANDBOX_INTEGRITY_KEY: `/${appName}/sandbox/integrityKey`,
        SANDBOX_EVENTS_KEY: `/${appName}/sandbox/eventsKey`,
      },
    });

    // ==================== API Gateway HTTP API ====================
    const httpApi = new apigateway.HttpApi(this, 'BackendHttpApi', {
      apiName: `${appName}-api`,
      corsPreflight: {
        allowOrigins: [`https://${distribution.domainName}`],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.PATCH,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['*'],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Add Lambda integration to API Gateway
    const lambdaIntegration = new apigatewayintegrations.HttpLambdaIntegration(
      'LambdaIntegration',
      lambdaFunction
    );

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigateway.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // ==================== Outputs ====================
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.domainName}`,
      description: 'CloudFront Frontend URL',
      exportName: `${appName}-frontend-url`,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
      description: 'API Gateway URL',
      exportName: `${appName}-api-url`,
    });

    new cdk.CfnOutput(this, 'TransactionsTableName', {
      value: transactionsTable.tableName,
      description: 'DynamoDB Transactions Table',
      exportName: `${appName}-transactions-table`,
    });

    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: productsTable.tableName,
      description: 'DynamoDB Products Table',
      exportName: `${appName}-products-table`,
    });

    new cdk.CfnOutput(this, 'StockTableName', {
      value: stockTable.tableName,
      description: 'DynamoDB Stock Table',
      exportName: `${appName}-stock-table`,
    });

    new cdk.CfnOutput(this, 'DeliveriesTableName', {
      value: deliveriesTable.tableName,
      description: 'DynamoDB Deliveries Table',
      exportName: `${appName}-deliveries-table`,
    });

    // ==================== Upload Frontend Build ====================
    new s3deploy.BucketDeployment(this, 'FrontendDeployment', {
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '../../..', 'apps/web/dist')
        ),
      ],
      destinationBucket: frontendBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // ==================== Write Config.json with API URL ====================
    // Create a Lambda that writes config.json to S3 with the API URL
    const configWriterLambda = new lambda.Function(this, 'ConfigWriterFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        
        const region = process.env.AWS_REGION || 'us-east-2';
        const s3 = new S3Client({ region });

        exports.handler = async (event) => {
          try {
            const { bucketName, apiUrl } = event;
            
            console.log('Writing config.json to S3...');
            console.log('Bucket:', bucketName);
            console.log('API URL:', apiUrl);

            const configBody = JSON.stringify({
              API_BASE_URL: apiUrl
            }, null, 2);

            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: '.config.json',
              ContentType: 'application/json',
              Body: configBody,
            });

            const result = await s3.send(command);
            
            console.log('Successfully wrote config.json to S3');
            return {
              statusCode: 200,
              body: JSON.stringify({ message: 'Config written successfully' })
            };
          } catch (error) {
            console.error('Error:', error);
            throw error;
          }
        };
      `),
    });

    // Grant Lambda permission to write to S3
    frontendBucket.grantWrite(configWriterLambda);

    // Create custom resource that invokes the Lambda
    new custom.AwsCustomResource(this, 'WriteConfigResource', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: configWriterLambda.functionName,
          Payload: JSON.stringify({
            bucketName: frontendBucket.bucketName,
            apiUrl: httpApi.url!,
          }),
        },
        physicalResourceId: custom.PhysicalResourceId.of('write-config'),
      },
      policy: custom.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [configWriterLambda.functionArn],
        }),
      ]),
    });
  }
}
