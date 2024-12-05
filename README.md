# Serverless AI Chatbot with AWS Lex, Lambda, and DynamoDB

This project demonstrates how to build a serverless AI chatbot using AWS Lex, AWS Lambda, and Amazon DynamoDB. The chatbot can troubleshoot basic API issues by dynamically retrieving answers from a DynamoDB table. This solution is deployed using AWS CDK, making it easily reproducible and scalable.

## Project Overview

The chatbot is designed to answer common API troubleshooting questions such as:

"Why is my API not responding?"
"How do I fix a 401 error?"
"What does a 429 error mean?"

The solution leverages AWS Lex for natural language understanding (NLU) and intent handling, AWS Lambda for backend logic, and DynamoDB to store FAQ data. All resources are managed using AWS CDK for infrastructure-as-code (IaC).

## Architecture Overview

AWS Lex: Manages conversational interactions and intent parsing.
AWS Lambda: Executes backend logic to fetch answers from DynamoDB.
Amazon DynamoDB: Stores frequently asked questions (FAQs) and corresponding answers.
AWS CDK: Deploys the infrastructure as code, ensuring easy management and scalability.
Features
Dynamic FAQ Lookup: The bot fetches answers from DynamoDB based on user queries.
Serverless: Utilizes AWS Lambda and Lex for cost-effective, scalable infrastructure.
Easy Deployment: Fully deployable using AWS CDK for consistent and repeatable environments.
Automatic Updates: Changes to FAQs are easily managed by updating the DynamoDB table.
