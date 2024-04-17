const axios = require('axios');
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require("@aws-sdk/client-sagemaker-runtime");
const plotly = require('plotly')('ad28', 'FZLKXin21Mvnz4uitIyi');

const studentID = 'M00809761';
const url = 'https://y2gtfx0jg3.execute-api.us-east-1.amazonaws.com/prod/';
const sagemakerClient = new SageMakerRuntimeClient({ region: "us-east-1" });

async function fetchAndPlotData() {
    try {
        // Fetch original data
        const originalData = (await axios.get(url + studentID)).data.target;
        const xValues = Array.from({ length: originalData.length }, (_, i) => i);

        // Call SageMaker endpoint to get predicted data
        const predictedData = await invokeEndpoint(originalData);

        // Check if predictedData is defined and has the predictions property
        if (predictedData && predictedData.predictions) {
            // Extract mean values from predicted data
            const predictedMean = predictedData.predictions[0].mean;

            // Generate x values for predicted data starting from hour 499
            const xValuesPredictions = Array.from({ length: predictedMean.length }, (_, i) => i + 500);

            // Plot original and predicted data
            await plotData(studentID, xValues, originalData, predictedMean, xValuesPredictions);
        } else {
            throw new Error('Predicted data is not in the expected format');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function invokeEndpoint(originalData) {
    try {
        // Define endpoint data
        const endpointData = {
            instances: [{
                "start": "2024-03-08 22:00:00",
                "target": originalData
            }],
            configuration: {
                "num_samples": 50,
                "output_types": ["mean", "quantiles", "samples"],
                "quantiles": ["0.1", "0.9"]
            }
        };

        // Create and send command with data
        const command = new InvokeEndpointCommand({
            EndpointName: "SyntheticDataEndpoint",
            Body: JSON.stringify(endpointData),
            ContentType: "application/json",
            Accept: "application/json"
        });

        // Call SageMaker endpoint
        const response = await sagemakerClient.send(command);

        // Parse and return predicted data
        return JSON.parse(Buffer.from(response.Body).toString('utf8'));
    } catch (error) {
        console.error('Error invoking endpoint:', error);
        throw error;
    }
}

// plot both datasets on graph
async function plotData(studentID, xValues, originalData, predictedMean, xValuesPredictions) {
    try {
        const originalTrace = {
            x: xValues,
            y: originalData,
            type: "scatter",
            mode: "line",
            name: "Original Data",
            marker: {
                color: '#D52E0B',
                size: 12
            }
        };

        const predictedTrace = {
            x: xValuesPredictions,
            y: predictedMean,
            type: "scatter",
            mode: "line",
            name: "Predicted Data",
            marker: {
                color: '#3182bd',
                size: 12
            }
        };

        const data = [originalTrace, predictedTrace];

        const layout = {
            title: `Synthetic Data for: ${studentID}`,
            font: { size: 25 },
            xaxis: { title: "Time (hours)" },
            yaxis: { title: "Value" }
        };

        const graphOptions = {
            layout: layout,
            filename: "synth-data",
            fileopt: "overwrite"
        };

        const plotUrl = await new Promise((resolve, reject) => {
            plotly.plot(data, graphOptions, (err, msg) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(msg.url);
                }
            });
        });

        console.log('Plot URL:', plotUrl);
    } catch (error) {
        console.error('Error plotting data:', error);
        throw error;
    }
}

fetchAndPlotData();
