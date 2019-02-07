import {SNS} from 'aws-sdk';
import {PackageEvent, PublishRequest} from './package-publish.d';
import {PackageEntries} from './package-entry/package-entry.d';
import {PackageStorage} from './storage/package-storage.d';

const PUBLISH_EVENT_SOURCE = 'data-lake';
const PUBLISH_EVENT_NAME = 'PACKAGE_CREATED';
const PUBLISH_EVENT_VERSION = '1.0';

export class PackagePublish {

    constructor(private topic: string,
                private sns: SNS,
                private packageEntries: PackageEntries,
                private packageStorage: PackageStorage) {
    }

    async publish({bucket, objectKey}: PublishRequest, correlationId: string): Promise<void> {
        const packageEntry = await this.packageEntries.packageEntry(bucket, objectKey);

        await this.publishEvent({
            tenantId: packageEntry.tenantId,
            packageId: packageEntry.packageId,
            type: packageEntry.type,
            contentType: packageEntry.contentType,
            createdAt: packageEntry.createdAt,
            downloadUrl: await this.downloadUrl(packageEntry.bucket, packageEntry.objectKey)
        }, correlationId);
    }

    private async downloadUrl(bucket: string, objectKey: string): Promise<string> {
        return await this.packageStorage.packageObject(bucket, objectKey).downloadUrl();
    }

    private async publishEvent(packageEvent: PackageEvent, correlationId: string): Promise<void> {
        await this.sns.publish({
            Message: JSON.stringify({
                Records: [{
                    correlationId,
                    eventSource: PUBLISH_EVENT_SOURCE,
                    eventName: PUBLISH_EVENT_NAME,
                    eventVersion: PUBLISH_EVENT_VERSION,
                    eventTime: new Date().toISOString(),
                    package: packageEvent,
                    identity: {}
                }]
            }),
            MessageAttributes: {
                'type': {
                    DataType: 'String',
                    StringValue: packageEvent.type
                },
                'contextType': {
                    DataType: 'String',
                    StringValue: packageEvent.contentType
                }
            },
            TopicArn: this.topic
        } as SNS.Types.PublishInput).promise();
    }
}
