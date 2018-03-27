const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

/**
 * Information about the Cognito user pool is saved in a table `Tenant`:
 * +-----------+--------------+-----------+
 * | tenant ID | user pool ID | client ID |
 * +-----------+--------------+-----------+
 */
export class TenantInfoUtil {

    getTenantInfo(tenantId: string): Promise<TenantInfo> {
        return new Promise((done: (iss) => void, reject) => {
            const params = {
                TableName: "Tenant",
                Key: {
                    tenantId: tenantId
                },
                AttributesToGet: [
                    'userPoolId', 'clientId'
                ]
            };
            dynamoDb.get(params, (err, response) => {
                if (err) {
                    reject("Cannot read from a database: " + JSON.stringify(err));
                } else {
                    if (response.Item) {
                        done(new TenantInfo(response.Item.userPoolId, response.Item.clientId));

                    } else {
                        reject("Cannot find a user pool for the tenant ID " + tenantId);
                    }
                }
            });
        });
    }
}

export class TenantInfo {
    userPoolId: string;
    clientId: string;

    constructor(userPoolId: string, clientId: string) {
        this.userPoolId = userPoolId;
        this.clientId = clientId;
    }
}