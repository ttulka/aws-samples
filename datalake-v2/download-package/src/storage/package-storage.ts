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

    downloadUrl(kmsKeyId: string, contentDisposition: string): string {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: this.key,
            //ServerSideEncryption: 'aws:kms',
            //SSEKMSKeyId: kmsKeyId,
            Expires: 24 * 60 * 60, // 1 day
            ResponseContentDisposition: contentDisposition ? contentDisposition.toString() : undefined
        });
    }
}