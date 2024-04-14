// Initialize WebSocket connection
const ws = new WebSocket('wss://r31lgwh3fk.execute-api.us-east-1.amazonaws.com/production/');

// Function to send data to the server
function fetchGraphData() {
    let msgObject = {
        action: "getMatchData",
        data: "test"
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

// Function to update match data and plot graph
function updateMatchData(data) {
    // Update matches array with received data
    matches = data; // Update with your data structure

    console.log(matches);

    // Check if matches array is not empty
    if (matches.length > 0) {
        // Update the Plotly graph with the received data
        const trace1 = {
            x: matches.map(match => match.MatchDate),
            y: matches.map(match => match.HomeGoals),
            mode: 'lines',
            name: 'Home Goals'
        };

        const trace2 = {
            x: matches.map(match => match.MatchDate),
            y: matches.map(match => match.AwayGoals),
            mode: 'lines',
            name: 'Away Goals'
        };

        const layout = {
            title: 'Goals Scored by Arsenal Matches',
            xaxis: { title: 'Match Date' },
            yaxis: { title: 'Goals' }
        };

        // Update the graph with new data
        Plotly.newPlot('graph', [trace1, trace2], layout);
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
