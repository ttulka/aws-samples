const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuidv1 = require('uuid/v1');

const TABLE_NAME = process.env.TABLE_NAME || "Config";

exports.handler = (event, context, callback) => {
    route(event, callback);
}

function route(event, callback) {
    const path = event.resource;
    const method = event.httpMethod;

    const tenantId = event.headers.tenantId;

    switch (method) {
        case 'GET':
            if (path == '/{id}') {
                let configId = event.pathParameters.id;
                get(tenantId, configId, callback);

            } else if (path == '/') {
                list(tenantId, callback);

            } else {
                error("Wrong URL.", callback);
            }
            break;
        case 'POST':
            if (path == '/') {
                create(tenantId, event.body, callback);

            } else {
                error("Wrong URL.", callback);
            }
            break;
        case 'PUT':
            if (path == '/{id}') {
                let configId = event.pathParameters.id;
                update(tenantId, configId, event.body, callback);

            } else {
                error("Wrong URL.", callback);
            }
            break;
        case 'DELETE':
            if (path == '/{id}') {
                let configId = event.pathParameters.id;
                remove(tenantId, configId, callback);

            } else {
                error("Wrong URL.", callback);
            }
            break;
    }
}

class Config {
    id: string;
    tenantId: string;
    name: string;

    constructor(id, tenantId, name) {
        this.id = id;
        this.tenantId = tenantId;
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
            let config = new Config(
                response.Item.configId,
                response.Item.tenantId,
                response.Item.configName
            );
            success(config, callback);
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
    done(400, JSON.stringify(err), callback);
}

function done(statusCode, body, callback, contentType = 'application/json', isBase64Encoded = false) {
    let response = {
        statusCode: statusCode,
        isBase64Encoded: isBase64Encoded,
        body: body,
        headers: {
            'Content-Type': contentType
        }
    };
    if (statusCode == 200) {
        callback(null, response);
    } else {
        callback(response, null);
    }

}