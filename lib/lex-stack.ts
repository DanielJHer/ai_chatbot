import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lex from 'aws-cdk-lib/aws-lex';
import * as iam from 'aws-cdk-lib/aws-iam';

export class LexStack extends Construct {
  public readonly bot: lex.CfnBot;

  constructor(scope: Construct, id: string, lambdaArn: string) {
    super(scope, id);

    // Define IAM role for Lex
    const lexRole = new iam.Role(this, 'LexRole', {
      assumedBy: new iam.ServicePrincipal('lex.amazonaws.com'),
    });

    // Add policy to IAM role
    lexRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole')
    );

    this.bot = new lex.CfnBot(this, 'LexBot', {
      name: 'APIChatBot',
      roleArn: lexRole.roleArn,
      dataPrivacy: {
        ChildDirected: false, // Mandatory field
      },
      idleSessionTtlInSeconds: 300, // Idle timeout in seconds
      botLocales: [
        {
          localeId: 'en_US', // Language and region
          nluConfidenceThreshold: 0.4, // Confidence threshold for intent matching
          intents: [
            {
              name: 'TroubleshootingIntent',
              fulfillmentCodeHook: {
                enabled: true,
              },
              sampleUtterances: [
                { utterance: 'Why is my API not responding?' },
                { utterance: 'How do I fix a 401 error?' },
                { utterance: 'What does a 429 error mean?' },
              ],
            },
            {
              name: 'FallbackIntent', // Explicitly reference fallback intent
              description: 'Default fallback intent',
              parentIntentSignature: 'AMAZON.FallbackIntent',
              fulfillmentCodeHook: { enabled: true },
            },
          ],
        },
      ],
      autoBuildBotLocales: true, // Automatically build locales
      // For test bots
      testBotAliasSettings: {
        botAliasLocaleSettings: [
          {
            localeId: 'en_US',
            botAliasLocaleSetting: {
              enabled: true,
              codeHookSpecification: {
                lambdaCodeHook: {
                  lambdaArn: lambdaArn, // ARN of your Lambda function
                  codeHookInterfaceVersion: '1.0',
                },
              },
            },
          },
        ],
      },
    });

    // Publish a numeric version of the bot
    const botVersion = new lex.CfnBotVersion(this, 'ChatBotVersion', {
      botId: this.bot.attrId, // Reference the bot ID
      botVersionLocaleSpecification: [
        {
          localeId: 'en_US', // Specify the locale
          botVersionLocaleDetails: {
            sourceBotVersion: 'DRAFT', // Publish from the DRAFT version
          },
        },
      ],
    });

    // Associate Lambda with Lex Bot
    const botAlias = new lex.CfnBotAlias(this, 'TestChatBotAlias', {
      botId: this.bot.attrId,
      botAliasName: 'TestChatBotAlias',
      botVersion: botVersion.attrBotVersion,
      botAliasLocaleSettings: [
        {
          localeId: 'en_US', // Specify the locale
          botAliasLocaleSetting: {
            enabled: true, // Enable the locale
            codeHookSpecification: {
              lambdaCodeHook: {
                codeHookInterfaceVersion: '1.0', // Lambda interface version
                lambdaArn: lambdaArn, // ARN of the Lambda function
              },
            },
          },
        },
      ],
    });

    // Lex bot alias output
    new cdk.CfnOutput(this, 'LexBotAlias', {
      value: botAlias.attrBotAliasId,
      description: 'Alias ID for Lex bot',
    });
  }
}
