import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {DynamoDB} from 'aws-sdk';
import {PackageEntries, PackageEntry} from './package-entry.d';

export class DynamoPackageEntries implements PackageEntries {

    constructor(private PACKAGE_TABLE: string, private dynamo: DocumentClient) {
    }

    async packageEntry(tenantId: string, packageId: string): Promise<PackageEntry> {
        const result = await this.dynamo.get({
            TableName: this.PACKAGE_TABLE,
            Key: {
                packageId, tenantId
            }
        } as DynamoDB.DocumentClient.GetItemInput).promise();

        if (!result.Item) {
            throw new Error('Package not found: ' + packageId);
        }
        return {
            packageId: result.Item.packageId,
            tenantId: result.Item.tenantId,
            createdAt: result.Item.createdAt,
            type: result.Item.type,
            contentType: result.Item.contentType,
            bucket: result.Item.s3Bucket,
            objectKey: result.Item.s3ObjectKey
        } as PackageEntry;
    }
}