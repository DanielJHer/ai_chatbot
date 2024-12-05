import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']

# Seed data
items = [
    {"question": "Why is my API not responding?", "answer": "Check if your server is reachable and ensure the endpoint URL is correct."},
    {"question": "How do I fix a 401 error?", "answer": "Ensure your API key is valid and has the necessary permissions."},
    {"question": "What does a 429 error mean?", "answer": "This indicates you've exceeded the API's rate limit. Wait before making more requests."},
]

def lambda_handler(event, context):
    
    try:
        table = dynamodb.Table(table_name)
        for item in items:
            table.put_item(Item=item)
            print("Seeding complete")
        return {
            "statusCode": 200,
            "body": "Seeding complete"
        }

    except Exception as e:
        print(f"Error seeding data: {e}")
        return {
            "statusCode": 500,
            "body": "Error seeding data"
        }
