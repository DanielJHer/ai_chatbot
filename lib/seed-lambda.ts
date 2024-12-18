import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export class SeedLambda extends Construct {
  public readonly lambda: lambda.Function;

  constructor(scope: Construct, id: string, tableName: string) {
    super(scope, id);

    // Define seed lambda function
    this.lambda = new lambda.Function(this, 'SeedLambda', {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: 'seed_lambda.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-files')),
      environment: {
        TABLE_NAME: tableName,
      },
    });
  }
}
