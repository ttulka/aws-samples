import {S3} from 'aws-sdk';

import {PackageObject, PackageStorage} from './package-storage.d';

export class S3PackageStorage implements PackageStorage {

    constructor(private s3: S3) {
    }

    packageObject(bucket, objectKey): PackageObject {
        return new S3PackageObject(bucket, objectKey, this.s3);
    }
}

class S3PackageObject implements PackageObject {

    constructor(private bucket: string, private key: string, private s3: S3) {
    }

    async uploadUrl(kmsKeyId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const params = {
                Bucket: this.bucket,
                Key: this.key,
                //ContentType: contentType,
                //ServerSideEncryption: 'aws:kms',
                //SSEKMSKeyId: keyId,
                Expires: 24 * 60 * 60 // 1 day
            };
            // It is important to use the callback parameter to make this call asynchronous,
            // because the sync mode doesn't work correctly with TemporaryCredentials
            this.s3.getSignedUrl('putObject', params, (err, url) => {
                if (err) reject(err);
                else resolve(url);
            });
        });
    }
}