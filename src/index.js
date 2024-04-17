// Initialize WebSocket connection
const ws = new WebSocket('wss://r31lgwh3fk.execute-api.us-east-1.amazonaws.com/production/');

// Get the value inside the <h1> tag with id "selectedTeam"
const selectedTeam = document.getElementById('selectedTeam').textContent;

console.log(selectedTeam);

// Function to send data to the server
function fetchGraphData() {
    let msgObject = {
        action: "getMatchData",
        data: selectedTeam,
    };

    // Check if the WebSocket connection is open
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msgObject));
        console.log("Message sent: " + JSON.stringify(msgObject));
    } else {
        console.log("WebSocket connection is not open yet.");
    }
}

// Array to store match data
let matches = [];

// Array to store sentiment data
let sentimentData = [];

// Function to update match data and plot graph
function updateMatchData(data) {
    // Update matches array with received data
    matches = data.matchData; // Update with your data structure
    sentimentData = data.sentimentData; // Update with sentiment data

    console.log(matches);
    console.log(sentimentData);

    // Sort matches array by MatchDate in descending order
    matches.sort((a, b) => a.MatchDate - b.MatchDate);

    // Convert Unix timestamp to normal date format for plotting the graph
    matches.forEach(match => {
        match.MatchDate = new Date(match.MatchDate * 1000).toLocaleDateString(); // Convert Unix timestamp to milliseconds
    });

    // Check if matches array is not empty
    if (matches.length > 0) {

        let selectedTeamGoalsFor = [];
        let goalsAgainst = [];

        // For each match find the goals for/against 
        matches.forEach(match => {
            // if selected team is playing ta home push goals to the goals for array
            if (match.HomeTeam === selectedTeam) {

                selectedTeamGoalsFor.push(match.HomeGoals);

                goalsAgainst.push(match.AwayGoals);
                
            } else if (match.AwayTeam === selectedTeam) {

                selectedTeamGoalsFor.push(match.AwayGoals);

                goalsAgainst.push(match.HomeGoals);
            }
        });


        // Update the line chart with the received match data
        const trace1 = {
            x: matches.map(match => match.MatchDate),
            y: selectedTeamGoalsFor,
            mode: 'lines',
            name: ('Goals scored by ' + selectedTeam)
        };

        const trace2 = {
            x: matches.map(match => match.MatchDate),
            y: goalsAgainst,
            mode: 'lines',
            name: 'Goals scored by opponents'
        };


        const lineColors = ['#2EB12A', '#D52E0B'];

        const layout = {
            title: 'Goals Scored by' + " " + selectedTeam + " " + 'Matches',
            xaxis: {
                title: 'Match Date',
                tickmode: 'auto', // Auto mode calculates label spacing automatically
                tickangle: -45, // Angle of the tick labels (optional)
                tickfont: {
                    size: 10 // Font size of the tick labels (optional)
                }
            },
            yaxis: { title: 'Goals' },
            colorway: lineColors

        };

        // Update the line chart with new data
        Plotly.newPlot('line-chart', [trace1, trace2], layout);

        // Create the pie chart using sentiment data
        const labels = sentimentData.map(item => item.label);



        // Calculate percentages for each sentiment category
        const total = sentimentData.length;
        const negCount = sentimentData.filter(item => item.label === 'neg').length;
        const posCount = sentimentData.filter(item => item.label === 'pos').length;
        const neutralCount = sentimentData.filter(item => item.label === 'neutral').length;

        const negPercentage = (negCount / total) * 100;
        const posPercentage = (posCount / total) * 100;
        const neutralPercentage = (neutralCount / total) * 100;


        const colors = ["#ff0000", "#3cb371", "#006dd1"];

        // Create pie chart data
        const pieData = [{
            labels: ['Negative', 'Positive', 'Neutral'],
            values: [negPercentage, posPercentage, neutralPercentage],
            type: 'pie',
            marker: {colors: colors}
        }];

        // Create pie chart layout
        const pieLayout = {
            title: 'Sentiment Analysis for ' + selectedTeam
        };

        // Create the pie chart
        Plotly.newPlot('pie-chart', pieData, pieLayout);


    } else {
        console.log("No match data available.");
    }
}

// Event listener for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Event listener for WebSocket connection opened
    ws.addEventListener('open', function (event) {
        console.log('WebSocket connection established: ' + JSON.stringify(event));
        // Once the WebSocket connection is open, fetch graph data
        fetchGraphData();
    });

    // Event listener for team links
    const teamLinks = document.querySelectorAll('.team-link');
    teamLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const href = link.getAttribute('href');
            fetch(href)
                .then(response => response.text())
                .then(html => {
                    document.documentElement.innerHTML = html;
                })
                .catch(error => {
                    console.error('Error fetching page:', error);
                });
        });
    });

    // Event listener for receiving data from the server
    ws.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        console.log('Received data from server:', data);
        // Call function to update match data and plot graph
        updateMatchData(data);
    });

    // Event listener for WebSocket errors
    ws.addEventListener('error', function (error) {
        console.log("WebSocket error:", error);
    });


});
