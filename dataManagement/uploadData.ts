import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Football, readFootballCSV } from './downloadData';

// Create DynamoDB client with default credential provider chain
const dynamodbClient = new DynamoDBClient({
    region: 'us-east-1',
    credentials: fromIni(),
});

// Function to upload data to DynamoDB
async function uploadFootballData() {
    // Read data from CSV file
    const data: Football[] = await readFootballCSV();

    // Iterate over each item in the data array and upload it to DynamoDB
    for (const match of data) {
        const params = {
            TableName: 'matches', // Replace 'YourTableName' with your DynamoDB table name
            Item: {
                MatchDate: { S: match.Date }, 
                TeamName: { S: match.HomeTeam }, 
                HomeTeam: { S: match.HomeTeam },
                AwayTeam: { S: match.AwayTeam },
                HomeGoals: { N: String(Number(match.FTHG)) },
                AwayGoals: { N: String(Number(match.FTAG)) }
            }
        };

        try {
            // Execute the PutItemCommand to put an item into the DynamoDB table
            await dynamodbClient.send(new PutItemCommand(params));
            console.log(`Uploaded match: ${match.HomeTeam} vs ${match.AwayTeam}`);
        } catch (error) {
            console.error('Error uploading match:', error);
        }
    }

    console.log('Upload completed!');
}

// Run the upload function
uploadFootballData();
