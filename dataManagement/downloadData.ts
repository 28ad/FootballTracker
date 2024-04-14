// import modules
const csv = require('csv-parser');
const fs = require('fs');

// set up file locations and names
const csvFile: string = "final_dataset.csv";
const dataFolder: string = "data";

// data to be read from the csv
export interface Football {
    Date: string,
    HomeTeam: string,
    AwayTeam: string,
    FTHG: string,
    FTAG: string,
}

// read file 
export function readFootballCSV(): Promise<Football[]> {
    return new Promise((resolve, reject) => {
        // Define an array to store football data
        const footballData: Football[] = [];
        
        // Define an array of teams to track
        const teamsToTrack: string[] = ["Crystal Palace", "Arsenal", "Tottenham", "Chelsea", "West Ham"];

        console.log("Reading CSV file ...");
        fs.createReadStream(dataFolder + "/" + csvFile)
            .pipe(csv())
            .on('data', (data: Football) => {
                // Convert date
                const date = new Date(convertDate(data.Date));

                // Check if the home team or away team is in the teamsToTrack array
                if (teamsToTrack.includes(data.HomeTeam) || teamsToTrack.includes(data.AwayTeam)) {
                    // Log data in console
                    console.log(`UnixTime: ${date.getTime()}.${data.HomeTeam} goals: ${data.FTHG}; ${data.AwayTeam} goals: ${data.FTAG}`);
                    footballData.push(data); // Add data to the array
                }
            })
            .on('end', () => {
                console.log("Finished reading file !");
                resolve(footballData); // Resolve the promise with the football data
            })
            .on('error', (error: any) => {
                reject(error); // Reject the promise if there's an error
            });
    });
}

// function to convert UK date to US date
function convertDate(date: string): string {
    const dateArray = date.split("/");
    // check for correct date format
    if (dateArray.length !== 3)
        throw `Date format is not correct: ${date}`;
    return `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`;
}

// Run the readFootballCSV function when the page loads
readFootballCSV()
    .then((data: Football[]) => {
        // Do something with the data if needed
    })
    .catch((error: any) => {
        console.error("Error:", error);
    });
