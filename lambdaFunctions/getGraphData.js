// Initialize the AWS SDK
const AWS = require("aws-sdk");

// Initialize the DynamoDB client
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

  // Query DynamoDB when the DOM content is loaded
  const params = {
    TableName: 'matches', 
    ExpressionAttributeValues: {
        ":team": { S: "Arsenal" } 
    },
    FilterExpression: "HomeTeam = :team OR AwayTeam = :team" // Filter by HomeTeam or AwayTeam
};

dynamodb.scan(params, (err, data) => {
    if (err) {
        console.error('Error retrieving data from DynamoDB:', err);
    } else {
        // Process the data
        const matches = data.Items.map(item => ({
            MatchDate: item.MatchDate.S,
            HomeTeam: item.HomeTeam.S,
            HomeGoals: parseInt(item.HomeGoals.N),
            AwayTeam: item.AwayTeam.S,
            AwayGoals: parseInt(item.AwayGoals.N)
        }));

    console.log(matches.length);

    }
});