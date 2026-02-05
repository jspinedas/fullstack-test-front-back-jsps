import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TODO: Agregar recursos AWS aquí en features futuros
    // Ejemplos:
    // - Lambda functions para el backend
    // - API Gateway
    // - DynamoDB tables
    // - S3 buckets para frontend estático
    // - CloudFront distribution
  }
}
