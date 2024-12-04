#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ChatBotStack } from '../lib/main-stack';

const app = new cdk.App();

new ChatBotStack(app, 'AiChatbotStack', {
  // ensure that the region supports Lex V2
  env: { region: 'us-east-1' },
});
