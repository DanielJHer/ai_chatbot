import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FAQTable } from './dynamodb-stack';
import { ChatBotLambdaFunction } from './chatbot_lambda';
import { LexStack } from './lex-stack';
import { SeedLambda } from './seed-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ChatBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create dynamodb table
    const faqTable = new FAQTable(this, 'FAQTableConstruct');

    // Create lambda function for chatbot
    const chatbotLambda = new ChatBotLambdaFunction(
      this,
      'ChatbotLambdaConstruct',
      faqTable.table.tableName
    );

    // Granting chatbot lambda function read access to dynamodb table
    faqTable.table.grantReadData(chatbotLambda.lambda);

    // Create seed lambda function for dynamodb table
    const seedLambda = new SeedLambda(
      this,
      'SeedLambdaConstruct',
      faqTable.table.tableName
    );

    // Grant the seed lambda write access to the dynamodb table
    faqTable.table.grantWriteData(seedLambda.lambda);

    // Create custom resource for seed lambda after deployment
    const customResourceProvider = new cdk.custom_resources.Provider(
      this,
      'SeedProvider',
      {
        onEventHandler: seedLambda.lambda,
      }
    );

    new cdk.CustomResource(this, 'SeedResource', {
      serviceToken: customResourceProvider.serviceToken,
    });

    // Create Lex Bot and Integrate with Lambda
    const lexBot = new LexStack(
      this,
      'LexBotConstruct',
      chatbotLambda.lambda.functionArn
    );

    // Ensure IAM permissions for lambda function
    chatbotLambda.lambda.grantInvoke(
      new iam.ServicePrincipal('lex.amazonaws.com')
    );

    // Lexbot outputs
    new cdk.CfnOutput(this, 'LexbotId', {
      value: lexBot.bot.attrId,
      description: 'ID of Lex bot',
    });
  }
}
