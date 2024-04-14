let AWS = require("aws-sdk");

let documentClient = new AWS.DynamoDB.documentClient();

exports.handler = async (event) => {

    let conId = event.requestContext.connectionId;
    console.log("Disconnecting client: " + conId);

    let params = {
        TableName: "WebSocketClients",
        Item: {
            connectionId: conId
        }
    };

    try {

        await documentClient.delete(params).promise();
        console.log("Connection ID deleted");

        return {
            statusCode: 200,
            body: "Client disconnected with ID: "+ conId
        };

    } catch (err) {

        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };

    }
}