// Initialize the AWS SDK
const AWS = require("aws-sdk");

// Initialize the DynamoDB client
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

  // Query DynamoDB when the DOM content is loaded
  const params = {
    TableName: 'matches', // Replace 'matches' with your actual table name
    ExpressionAttributeValues: {
        ":team": { S: "Arsenal" } // Specify the team name
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

       // Log properties of each object in matches
    //    matches.forEach(match => {
    //     console.log('Match Date:', match.MatchDate);
    //     console.log('Home Team:', match.HomeTeam);
    //     console.log('Home Goals:', match.HomeGoals);
    //     console.log('Away Team:', match.AwayTeam);
    //     console.log('Away Goals:', match.AwayGoals);
    //     console.log('---------------------------------------');
    // });

    console.log(matches.length);

    }
});