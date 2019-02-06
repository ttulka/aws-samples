import {UploadRequest, UploadResponse} from './package-upload.d';
import {PackageEntries, PackageEntry} from './package-entry/package-entry.d';
import {PackageStorage} from './storage/package-storage.d';
import {PackageTags} from './tagging/package-tags.d';

export class PackageUpload {

    constructor(private readonly PACKAGE_TABLE: string, private readonly KMS_KEY_ID: string,
                private packageEntries: PackageEntries,
                private packageTags: PackageTags,
                private packageStorage: PackageStorage) {
    }

    async response({tenantId, type, contentType, tags}: UploadRequest): Promise<UploadResponse> {
        if (!tenantId) {
            throw new Error('\'tenantId\' is missing in the request.');
        }
        if (!type) {
            throw new Error('\'type\' is missing in the request.');
        }
        if (!contentType) {
            throw new Error('\'contentType\' is missing in the request.');
        }
        const packageEntry = await this.packageEntries.savedPackageEntry({tenantId, type, contentType} as PackageEntry);

        if (tags && tags.length) {
            await this.packageTags.saveTags(tenantId, packageEntry.packageId, tags);
        }
        return {
            packageId: packageEntry.packageId,
            uploadUrl: await this.uploadUrl(packageEntry, this.KMS_KEY_ID)
        };
    }

    private async uploadUrl(packageEntry: PackageEntry, keyId: string): Promise<string> {
        return this.packageStorage.packageObject(packageEntry.bucket, packageEntry.objectKey)
            .uploadUrl(this.KMS_KEY_ID);
    }
}
