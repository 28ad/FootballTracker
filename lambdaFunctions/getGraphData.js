const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { ApiGatewayManagementApi, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi");
const WebSocket = require('ws');

// Configure AWS credentials and region 
const REGION = 'us-east-1'; 

// Create DynamoDB service object
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function fetchDataFromDynamoDB(teamName, tableName) {
    let params = {
        TableName: tableName, 
    };

    // Apply filter if teamName is provided
    if (teamName && tableName === 'matchResults') {
        params.ExpressionAttributeValues = {
            ":team": { S: teamName }
        };
        params.FilterExpression = "HomeTeam = :team OR AwayTeam = :team";
    } else if (teamName && tableName === 'SentimentAnalysis') {
        params.ExpressionAttributeValues = {
            ":team": { S: teamName }
        };
        params.FilterExpression = "team = :team";
    }

    try {
        const data = await client.send(new ScanCommand(params));
        if (tableName === 'matchResults') {
            return data.Items.map(item => ({
                MatchDate: item.MatchDate.N,
                HomeTeam: item.HomeTeam.S,
                HomeGoals: parseInt(item.HomeGoals.N),
                AwayTeam: item.AwayTeam.S,
                AwayGoals: parseInt(item.AwayGoals.N)
            }));
        } else if (tableName === 'SentimentAnalysis') {
            return data.Items.map(item => ({
                title: item.title ? item.title.S : null,
                label: item.label ? item.label.S : null,
                team: item.team ? item.team.S : null
            }));
        } else {
            console.error('Invalid table name:', tableName);
            return []; // Return an empty array for invalid table names
        }
    } catch (err) {
        console.error('Error retrieving data from DynamoDB:', err);
        return []; // Return an empty array in case of error
    }
}

// Lambda function handler
exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    try {
        let teamName = null;
        let matchData = [];
        let sentimentData = [];

        // Check if the WebSocket event has a data property in the body
        if (event.body) {
            const eventData = JSON.parse(event.body);
            if (eventData.data && ["Arsenal", "West Ham", "Chelsea", "Tottenham", "Crystal Palace"].includes(eventData.data)) {
                teamName = eventData.data;
            }
        }

        // Retrieve data from DynamoDB for match results
        matchData = await fetchDataFromDynamoDB(teamName, 'matchResults');

        // Retrieve data from DynamoDB for sentiment analysis
        sentimentData = await fetchDataFromDynamoDB(teamName, 'SentimentAnalysis');


        console.log('Match Data:', matchData);
        console.log('Sentiment Data:', sentimentData);
        
        // Combine match data and sentiment data
        const combinedData = { matchData, sentimentData };

        // Convert data to JSON
        const jsonData = JSON.stringify(combinedData);

        // Send data to connected clients
        const apiGatewayManagementApi = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`
        });

        await apiGatewayManagementApi.send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: jsonData
        }));

        return { statusCode: 200, body: 'Data sent successfully.' };
    } catch (error) {
        console.error('Error processing request:', error);
        return { statusCode: 500, body: 'Internal server error.' };
    }
};

