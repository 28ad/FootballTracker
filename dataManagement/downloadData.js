"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFootballCSV = void 0;
// import modules
var csv = require('csv-parser');
var fs = require('fs');
// set up file locations and names
var csvFile = "final_dataset.csv";
var dataFolder = "data";
// read file 
function readFootballCSV() {
    return new Promise(function (resolve, reject) {
        // Define an array to store football data
        var footballData = [];
        // Define an array of teams to track
        var teamsToTrack = ["Crystal Palace", "Arsenal", "Tottenham", "Chelsea", "West Ham"];
        console.log("Reading CSV file ...");
        fs.createReadStream(dataFolder + "/" + csvFile)
            .pipe(csv())
            .on('data', function (data) {
            // Convert date
            var date = new Date(convertDate(data.Date));
            // Check if the home team or away team is in the teamsToTrack array
            if (teamsToTrack.includes(data.HomeTeam) || teamsToTrack.includes(data.AwayTeam)) {
                // Log data in console
                console.log("UnixTime: ".concat(date.getTime(), ".").concat(data.HomeTeam, " goals: ").concat(data.FTHG, "; ").concat(data.AwayTeam, " goals: ").concat(data.FTAG));
                footballData.push(data); // Add data to the array
            }
        })
            .on('end', function () {
            console.log("Finished reading file !");
            resolve(footballData); // Resolve the promise with the football data
        })
            .on('error', function (error) {
            reject(error); // Reject the promise if there's an error
        });
    });
}
exports.readFootballCSV = readFootballCSV;
// function to convert UK date to US date
function convertDate(date) {
    var dateArray = date.split("/");
    // check for correct date format
    if (dateArray.length !== 3)
        throw "Date format is not correct: ".concat(date);
    return "".concat(dateArray[1], "/").concat(dateArray[0], "/").concat(dateArray[2]);
}
// Run the readFootballCSV function when the page loads
readFootballCSV()
    .then(function (data) {
    // Do something with the data if needed
})
    .catch(function (error) {
    console.error("Error:", error);
});
