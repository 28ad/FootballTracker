const axios = require('axios');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
// Configure AWS credentials and region (if not configured via environment variables)
const REGION = 'us-east-1'; // Change this to your desired AWS region

// Create DynamoDB service object
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Lambda function handler
exports.handler = async (event) => {
    
    
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        

        // Process each record in the event
        for (const record of event.Records) {
            
             if (record.eventName !== "INSERT") {
                return { statusCode: 400, message: "Not expected event" };
            }

            
            // extract title and team values
            const title = record.dynamodb.NewImage.Title.S; // Access the 'title' attribute
            const team = record.dynamodb.NewImage.Team.S; // Access the 'team' attribute
            
            console.log(team + title);


            // Perform sentiment analysis
            const label = await tpSentiment(title);

            // Save sentiment analysis to DynamoDB
            const params = {
                TableName: 'SentimentAnalysis',
                Item: {
                    title: title,
                    team: team,
                    label: label
                }
            };

            try {
                // Use the put method of the DynamoDBDocumentClient
                await docClient.send(new PutCommand(params));
                console.log('Sentiment analysis saved to DynamoDB:', params.Item);
            } catch (error) {
                console.error('Error saving sentiment analysis to DynamoDB:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error processing DynamoDB event:', error);
        throw error;
    }
};

// Calls text-processing web service and returns sentiment label
async function tpSentiment(title) {
    // URL of text-processing API
    const url = 'http://text-processing.com/api/sentiment/';

    try {
        // Send POST request to API with article title
        const response = await axios.post(url, {
            text: title
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Return sentiment label
        return response.data.label;
    } catch (error) {
        console.error('Error occurred during sentiment analysis:', error);
        throw error;
    }
}
