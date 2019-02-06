import * as uuidv1 from 'uuid/v1';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {PackageData, PackageEntries, PackageEntry} from './package-entry.d';

export class DynamoPackageEntries implements PackageEntries {

    constructor(private PACKAGE_TABLE: string, private S3_BUCKET: string, private dynamo: DocumentClient) {
    }

    async savedPackageEntry(packageData: PackageData): Promise<PackageEntry> {
        const packageId: string = uuidv1();
        const createdAt = new Date().toISOString();

        const bucket = this.S3_BUCKET;

        const objectKeyHash = packageId.substr(0, 8);
        const objectKey = objectKeyHash + "/" + packageData.tenantId + "/" + packageId;

        await this.dynamo.put({
            TableName: this.PACKAGE_TABLE,
            Item: {
                ...packageData,
                packageId,
                s3Bucket: bucket,
                s3ObjectKey: objectKey,
                createdAt
            }
        }).promise();

        return {
            ...packageData,
            packageId,
            bucket,
            objectKey,
            createdAt
        } as PackageEntry;
    }
}