import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Football, readFootballCSV } from './downloadData';

// Create DynamoDB client with default credential provider chain
const dynamodbClient = new DynamoDBClient({
    region: 'us-east-1',
    credentials: fromIni(),
});

// Function to convert UK date to Unix timestamp
function convertUKDateToUnixTimestamp(dateString) {
    const dateArray = dateString.split("/");
    // Check for correct date format
    if (dateArray.length !== 3) {
        console.error(`Date format is not correct: ${dateString}`);
        return null;
    }
    // Reformat date to US format (MM/DD/YYYY)
    const usDateFormat = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`;
    const timestamp = new Date(usDateFormat).getTime(); // Get timestamp in milliseconds

    // Check if the timestamp is a valid number
    if (!isNaN(timestamp)) {
        return Math.floor(timestamp / 1000); // Convert milliseconds to seconds
    } else {
        console.error('Invalid date format:', dateString);
        return null; // Return null if date conversion fails
    }
}



// Function to upload data to DynamoDB
async function uploadFootballData() {
    // Read data from CSV file
    const data: Football[] = await readFootballCSV();

    // Iterate over each item in the data array and upload it to DynamoDB
    for (const match of data) {

        const homeGoals = Number(match.FTHG);
        const awayGoals = Number(match.FTAG);

        if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
            const params = {
                TableName: 'matchResults',
                Item: {
                    MatchDate: { N: String(convertUKDateToUnixTimestamp(match.Date)) }, // Convert date to Unix timestamp
                    HomeTeam: { S: match.HomeTeam },
                    AwayTeam: { S: match.AwayTeam },
                    HomeGoals: { N: String(homeGoals) },
                    AwayGoals: { N: String(awayGoals) }
                }
            };

            try {
                // Execute the PutItemCommand to put an item into the DynamoDB table
                await dynamodbClient.send(new PutItemCommand(params));
                console.log(`Uploaded match: ${match.HomeTeam} vs ${match.AwayTeam}`);
            } catch (error) {
                console.error('Error uploading match:', error);
            }

           
        } else {
            console.error('Invalid numeric value for home goals or away goals:', match.FTHG, match.FTAG);
        }


        
    }

    console.log('Upload completed!');
}


// Run the upload function
uploadFootballData();
