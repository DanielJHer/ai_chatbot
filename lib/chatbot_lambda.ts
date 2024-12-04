import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export class ChatBotLambdaFunction extends Construct {
  public readonly lambda: lambda.Function;

  constructor(scope: Construct, id: string, tableName: string) {
    super(scope, id);

    // Defining lambda function
    this.lambda = new lambda.Function(this, 'ChatbotLambda', {
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: 'chatbot_lambda.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-files')),
      environment: {
        TABLE_NAME: tableName,
      },
    });
  }
}
