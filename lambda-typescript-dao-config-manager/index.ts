const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuidv1 = require('uuid/v1');

const TABLE_NAME = process.env.TABLE_NAME || "Config";

exports.handler = (event, context, callback) => {
    route(event, callback);
}

function route(event, callback) {
    const method = event.httpMethod;

    const tenantId = event.headers ? event.headers.tenantId : null;
    if (!tenantId) {
        error("Tenant ID missing in the header.", callback);
    }

    switch (method) {
        case 'GET':
            if (event.pathParameters) {
                let configId = event.pathParameters.id;
                get(tenantId, configId, callback);

            } else {
                list(tenantId, callback);
            }
            break;

        case 'POST':
            if (!event.body) {
                error("Wrong payload.", callback);
            } else {
                create(tenantId, JSON.parse(event.body), callback);
            }
            break;

        case 'PUT':
            if (!event.pathParameters) {
                error("Config ID is missing.", callback);
            } else  if (!event.body) {
                error("Wrong payload.", callback);
            } else {
                let configId = event.pathParameters.id;
                update(tenantId, configId, JSON.parse(event.body), callback);
            }
            break;

        case 'DELETE':
            if (!event.pathParameters) {
                error("Config ID is missing.", callback);
            } else {
                let configId = event.pathParameters.id;
                remove(tenantId, configId, callback);
            }
            break;
    }
}

class Config {
    id: string;
    name: string;

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

function get(tenantId, configId, callback) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            tenantId: tenantId,
            configId: configId
        }
    };
    dynamoDb.get(params, (err, response) => {
        if (err) {
            error(err, callback);
        } else {
            if (response.Item) {
                let config = new Config(
                    response.Item.configId,
                    response.Item.configName
                );
                success(config, callback);
            } else {
                error("Cannot find ID " + configId, callback);
            }
        }
    });
}

function list(tenantId, callback) {
    const params = {
        TableName: TABLE_NAME,
        ProjectionExpression: [
            "configId", "configName"
        ],
        KeyConditionExpression: 'tenantId = :tenantId',
        ExpressionAttributeValues: {
            ':tenantId': tenantId
        }
    };
    dynamoDb.query(params, (err, response) => {
        if (err) {
            error(err, callback);
        } else {
            let data = response.Items.map(x => {
                return {
                    id: x.configId,
                    name: x.configName
                }
            });

            success(data, callback);
        }
    });
}

function create(tenantId, payload, callback) {
    let configId = uuidv1();

    const params = {
        TableName: TABLE_NAME,
        Item: {
            tenantId: tenantId,
            configId: configId,
            configName: payload.name
        }
    };
    dynamoDb.put(params, (err, response) => {
        if (err) {
            error(err, callback);
        } else {
            success({id: configId}, callback);
        }
    });
}

function update(tenantId, configId, config, callback) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            tenantId: tenantId,
            configId: configId
        },
        AttributeUpdates: {
            configName: {
                Action: 'PUT',
                Value: config.name
            }
        }
    };
    dynamoDb.update(params, (err, response) => {
        if (err) {
            error(err, callback);
        } else {
            success({id: configId}, callback);
        }
    });
}

function remove(tenantId, configId, callback) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            tenantId: tenantId,
            configId: configId
        }
    };
    dynamoDb.delete(params, (err, response) => {
        if (err) {
            error(err, callback);
        } else {
            success({id: configId}, callback);
        }
    });
}

function success(body, callback) {
    done(200, body, callback);
}

function error(err, callback) {
    console.error(err);
    done(400, err, callback);
}

function done(statusCode, body, callback, contentType = 'application/json', isBase64Encoded = false) {
    let response = {
        statusCode: statusCode,
        isBase64Encoded: isBase64Encoded,
        body: typeof body == 'string' ? "{\"message\": \"" + body  + "\"}" : JSON.stringify(body),
        headers: {
            'Content-Type': contentType
        }
    };
    callback(null, response);
}