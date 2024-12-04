import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class SeedLambda extends Construct {
  public readonly lambda: lambda.Function;

  constructor(scope: Construct, id: string, tableName: string) {
    super(scope, id);

    // Define seed lambda function
    this.lambda = new lambda.Function(this, 'SeedLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const dynamodb = new AWS.DynamoDB.DocumentClient();
  
          const items = [
            { question: "Why is my API not responding?", answer: "Check if your server is reachable and ensure the endpoint URL is correct." },
            { question: "How do I fix a 401 error?", answer: "Ensure your API key is valid and has the necessary permissions." },
            { question: "What does a 429 error mean?", answer: "This indicates you've exceeded the API's rate limit. Wait before making more requests." }
          ];
  
          exports.handler = async () => {
            const tableName = process.env.TABLE_NAME;
            try {
              for (const item of items) {
                await dynamodb.put({ TableName: tableName, Item: item }).promise();
              }
              console.log("Seeding complete");
              return { statusCode: 200, body: "Seeding complete" };
            } catch (error) {
              console.error("Error seeding data:", error);
              return { statusCode: 500, body: "Error seeding data" };
            }
          };
        `),
      environment: {
        TABLE_NAME: tableName,
      },
    });
  }
}
