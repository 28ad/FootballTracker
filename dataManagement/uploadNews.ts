import AWS from 'aws-sdk';
import { NewsAPIResult, downloadNewsData } from './downloadNews'; // Assuming 'downloadNewsData.ts' exports the 'downloadNewsData' function

// Configure AWS credentials and region
AWS.config.update({ region: 'us-east-1' });

// Create a DynamoDB service object
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Function to upload news articles to DynamoDB
async function uploadNewsArticles(result: NewsAPIResult): Promise<void> {
    const tableName = 'NewsArticles';

    console.log('Uploading news articles to DynamoDB...');

    try {
        // Iterate over each article in the result and upload it to DynamoDB
        for (const article of result.articles) {
            const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
                TableName: tableName,
                Item: {
                    Team: extractTeamName(article.title), // Extract team name from article title
                    PublishedAt: article.publishedAt, // Use article published date as sort key
                    Title: article.title // Store article title
                }
            };

            await dynamodb.put(params).promise();
            console.log(`Uploaded article: ${article.title}`);
        }

        console.log('Upload completed!');
    } catch (error) {
        console.error('Error uploading articles:', error);
    }
}

// Function to extract team name from article title
function extractTeamName(title: string): string {
    // extract team name from the article title

    const teamNames = ["Crystal Palace", "Palace", "Arsenal",  "Tottenham", "Spurs", "Chelsea", "West Ham", " The Irons"];
    for (const team of teamNames) {
        if (title.toLowerCase().includes(team.toLowerCase())) {
            return team;
        }
    }
    return 'Other';
}

// Run the upload function after downloading news data
downloadNewsData()
    .then(result => uploadNewsArticles(result))
    .catch(error => console.error('Error downloading news data:', error));
