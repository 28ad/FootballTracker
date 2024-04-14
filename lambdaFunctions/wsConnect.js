let AWS = require("aws-sdk");

let documentClient = new AWS.DynamoDB.documentClient();

exports.handler = async (event) => {

    let conId = event.requestContext.connectionId;
    console.log("Client connected: " + conId);

    let params = {
        TableName: "WebSocketClients",
        Item: {
            connectionId: conId
        }
    };

    try {

        await documentClient.put(params).promise();
        console.log("Connection ID stored");

        return {
            statusCode: 200,
            body: "Client connected with ID: "+ conId
        };

    } catch (err) {

        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };

    }
}