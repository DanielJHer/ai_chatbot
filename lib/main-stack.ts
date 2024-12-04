import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FAQTable } from './dynamodb-stack';
import { LambdaFunction } from './lambda-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { env } from 'process';

export class ChatBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create dynamodb table
    const faqTable = new FAQTable(this, 'FAQTableConstruct');

    // Create lambda function
    const chatbotLambda = new LambdaFunction(
      this,
      'LambdaConstruct',
      faqTable.table.tableName
    );

    // Granting chatbot lambda function read access to dynamodb table
    faqTable.table.grantReadData(chatbotLambda.lambda);

    // Create Lambda function to seed Dynamodb table
    const seedLambda = new lambda.Function(this, 'SeedLambda', {
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
        TABLE_NAME: faqTable.table.tableName,
      },
    });

    // Grant the seed lambda write access to the dynamodb table
    faqTable.table.grantWriteData(seedLambda);

    // Invoke the seed lambda after deployment
    const customResourceProvider = new cdk.custom_resources.Provider(
      this,
      'SeedProvider',
      {
        onEventHandler: seedLambda,
      }
    );

    // Create custom resource for seed lambda
    new cdk.CustomResource(this, 'SeedResource', {
      serviceToken: customResourceProvider.serviceToken,
    });
  }
}
