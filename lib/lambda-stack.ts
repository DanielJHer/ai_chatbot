import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class LambdaFunction extends Construct {
  public readonly lambda: lambda.Function;

  constructor(scope: Construct, id: string, tableName: string) {
    super(scope, id);

    // Defining lambda function
    this.lambda = new lambda.Function(this, 'ChatbotLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();

        exports.handler = async (event) => {
          const params = {
            TableName: '${tableName}',
            Key: { question: event.inputTranscript },
          };

          try {
            const data = await dynamodb.get(params).promise();
            return {
              dialogAction: {
                type: 'Close',
                fulfillmentState: 'Fulfilled',
                message: {
                  contentType: 'PlainText',
                  content: data.Item ? data.Item.answer : "I couldn't find an answer to your question.",
                },
              },
            };
          } catch (err) {
            console.error('Error:', err);
            return {
              dialogAction: {
                type: 'Close',
                fulfillmentState: 'Fulfilled',
                message: {
                  contentType: 'PlainText',
                  content: 'There was an error processing your request. Please try again later.',
                },
              },
            };
          }
        };
      `),
    });
  }
}
