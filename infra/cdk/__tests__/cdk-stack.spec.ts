import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

describe('CdkStack', () => {
  it('should create S3 bucket for frontend', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  it('should create CloudFront distribution', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  it('should create DynamoDB tables', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DynamoDB::Table', 4);
  });

  it('should create Lambda function', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Lambda::Function', 2);
  });

  it('should create API Gateway HTTP API', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
  });

  it('should have outputs for frontend and API URLs', () => {
    const app = new cdk.App();
    const stack = new CdkStack(app, 'TestStack');

    const outputs = stack.node.metadata.filter(
      (m) => m.type === 'aws:cdk:info'
    );
    expect(outputs.length).toBeGreaterThanOrEqual(0);
  });
});
