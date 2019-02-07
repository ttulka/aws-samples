import {Context, S3Event} from 'aws-lambda';
import {PackagePublish} from './package-publish';
import {DynamoDB, S3, SNS} from 'aws-sdk';
import {DynamoPackageEntries} from './package-entry/package-entry';
import {S3PackageStorage} from './storage/package-storage';

const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const sns = new SNS({apiVersion: '2010-03-31'});
const s3 = new S3({apiVersion: '2006-03-01', signatureVersion: 'v4'});

export async function handle(event: S3Event, context: Context) {
    console.log('EVENT', JSON.stringify(event));
    try {
        validateEnvVariables();

        await Promise.all(event.Records
            .map(rec => eventPublisher().publish({
                    bucket: rec.s3.bucket.name,
                    objectKey: rec.s3.object.key
                }, context.awsRequestId)
            ));

        return 'success';

    } catch (err) {
        console.error('ERROR', err);
        throw err;
    }
}

function eventPublisher() {
    return new PackagePublish(process.env.TOPIC_ARN, sns,
        new DynamoPackageEntries(process.env.PACKAGE_TABLE, dynamo),
        new S3PackageStorage(s3)
    );
}

function validateEnvVariables() {
    if (!process.env.PACKAGE_TABLE) {
        throw new Error('PACKAGE_TABLE environment variable is not defined.');
    }
    if (!process.env.TOPIC_ARN) {
        throw new Error('TOPIC_ARN environment variable is not defined.');
    }
}