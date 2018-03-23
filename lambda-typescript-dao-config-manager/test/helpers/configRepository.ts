const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const tableName = "Config";
const tenantId = "TEST";

export function deleteItem(id: string) {
    return new Promise((done: () => void, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                configId: id,
                tenantId: tenantId
            }
        };
        dynamoDb.delete(params, (err, response) => {
            if (err) {
                reject(JSON.stringify(err));
            }
            done();
        });
    });
}

export function addItem(id: string, name: string, installationPath: string, httpPort: number, mysqlPort: number, version: string) {
    return new Promise((done: () => void, reject) => {
        const params = {
            TableName: tableName,
            Item: {
                tenantId: tenantId,
                configId: id,
                configName: name
            }
        };
        dynamoDb.put(params, (err, response) => {
            if (err) {
                reject(JSON.stringify(err));
            }
            done();
        });
    });
}