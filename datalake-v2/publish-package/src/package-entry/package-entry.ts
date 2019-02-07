import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {DynamoDB} from 'aws-sdk';
import {PackageEntries, PackageEntry} from './package-entry.d';

export class DynamoPackageEntries implements PackageEntries {

    constructor(private PACKAGE_TABLE: string, private dynamo: DocumentClient) {
    }

    async packageEntry(bucket: string, objectKey: string): Promise<PackageEntry> {
        const keyParts = /(.+)\/(.+)\/(.+)/.exec(objectKey);    // objectKey: "hash/tenantId/packageId"
        if (!keyParts) {
            throw new Error('S3 Key does not match the expected pattern: ' + objectKey);
        }
        const tenantId = keyParts[2],
            packageId = keyParts[3];

        const packageResult: DynamoDB.DocumentClient.QueryOutput = await this.dynamo.query({
            TableName: this.PACKAGE_TABLE,
            KeyConditionExpression: 'packageId = :packageId and tenantId = :tenantId',
            ExpressionAttributeValues: {
                ":packageId": packageId,
                ':tenantId': tenantId
            }
        } as DynamoDB.DocumentClient.QueryInput).promise();

        if (!packageResult.Items || !packageResult.Items.length) {
            throw new Error('Package for packageId: ' + packageId + ', tenantId: ' + tenantId + ' not found.');
        }
        const packageItem = packageResult.Items[0];
        return {
            packageId: packageItem.packageId,
            tenantId: packageItem.tenantId,
            name: packageItem.name,
            type: packageItem.type,
            contentType: packageItem.contentType,
            bucket: packageItem.s3Bucket,
            objectKey: packageItem.s3ObjectKey,
            createdAt: packageItem.createdAt
        } as PackageEntry;
    }
}