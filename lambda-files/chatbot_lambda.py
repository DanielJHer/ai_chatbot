import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['TABLE_NAME']

def lambda_handler(event, context):
    try:
        # Extract user input from Lex event
        user_question = event['inputTranscript'].lower()

        # Query dynamodb for matching question
        table = dynamodb.Table(table_name)
        response = table.scan()
        items = response.get('Items', [])

        # Search for matching answer
        for item in items:
            if user_question == item.get('question', '').lower():
                return {
                    "sessionState": {
                        "dialogAction": {"type": "Close"},
                        "intent": {
                            "name": event['sessionState']['intent']['name'],
                            "state": "Fulfilled"
                        }
                    },
                    "messages": [
                        {"contentType": "PlainText", "content": item.get('answer')}
                    ]
                }

        # Return fallback response if no match is found
        return {
            "sessionState": {
                "dialogAction": {"type": "Close"},
                "intent": {
                    "name": event['sessionState']['intent']['name'],
                    "state": "Fulfilled"
                }
            },
            "messages": [
                {"contentType": "PlainText", "content": "I'm sorry, I couldn't find an answer to your question."}
            ]
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "sessionState": {
                "dialogAction": {"type": "Close"},
                "intent": {
                    "name": event['sessionState']['intent']['name'],
                    "state": "Failed"
                }
            },
            "messages": [
                {"contentType": "PlainText", "content": "An error occurred while processing your request."}
            ]
        }