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

    // Define Lex bot
    this.bot = new lex.CfnBot(this, 'Chatbot', {
      name: 'APIChatbot',
      roleArn: lexRole.roleArn,
      dataPrivacy: { childDirected: false },
      idleSessionTtlInSeconds: 300,
      botLocales: [
        {
          localeId: 'en_US',
          nluConfidenceThreshold: 0.4,
          intents: [
            {
              name: 'TroubleshootingIntent',
              fulfillmentCodeHook: { enabled: true },
              sampleUtterances: [
                { utterance: 'Why is my API not responding?' },
                { utterance: 'How do I fix a 401 error?' },
                { utterance: 'What does a 429 error mean?' },
              ],
            },
          ],
        },
      ],
    });

    // Associate Lambda with Lex Bot
    const botAlias = new lex.CfnBotAlias(this, 'ChatBotAlias', {
      botId: this.bot.attrId,
      botAliasName: 'ChatBotAlias',
      botVersion: '$LATEST',
    });

    new cdk.CfnOutput(this, 'LexBotAlias', {
      value: botAlias.attrBotAliasId,
      description: 'Alias ID for Lex bot',
    });
  }
}
