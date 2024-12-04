import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class FAQTable extends Construct {
  // Expose the table as a public readonly property
  public readonly table: dynamodb.Table;

  // Constructor
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // Defining the DynamoDB table
    this.table = new dynamodb.Table(this, 'FAQTable', {
      partitionKey: { name: 'question', type: dynamodb.AttributeType.STRING },
      tableName: 'FAQTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });

    // Output the table name
    new cdk.CfnOutput(this, 'FAQTableName', {
      value: this.table.tableName,
      description: 'Name of the DynamoDB table',
    });
  }
}
