import {DownloadRequest, DownloadResponse} from './package-download.d';
import {PackageEntries, PackageEntry} from './package-entry/package-entry.d';
import {PackageStorage} from './storage/package-storage.d';
import {PackageTags, Tag} from './tagging/package-tags.d';

export class PackageDownload {

    constructor(private readonly PACKAGE_TABLE: string, private readonly KMS_KEY_ID: string,
                private packageEntries: PackageEntries,
                private packageTags: PackageTags,
                private packageStorage: PackageStorage) {
    }

    async response({tenantId, packageId, responseContentDisposition}: DownloadRequest): Promise<DownloadResponse> {
        if (!tenantId) {
            throw new Error('\'tenantId\' is missing in the request.');
        }
        if (!packageId) {
            throw new Error('\'packageId\' is missing in the request.');
        }
        const packageEntry = await this.packageEntries.packageEntry(tenantId, packageId);
        return {
            packageId: packageEntry.packageId,
            tenantId: packageEntry.tenantId,
            createdAt: packageEntry.createdAt,
            type: packageEntry.type,
            contentType: packageEntry.contentType,
            downloadUrl: await this.downloadUrl(packageEntry, responseContentDisposition),
            tags: await this.tags(tenantId, packageId)
        };
    }

    private async downloadUrl(packageEntry: PackageEntry, responseContentDisposition: string): Promise<string> {
        return this.packageStorage.packageObject(packageEntry.bucket, packageEntry.objectKey)
            .downloadUrl(this.KMS_KEY_ID, responseContentDisposition);
    }

    private async tags(tenantId: string, packageId: string): Promise<Tag[]> {
        return await this.packageTags.tags(tenantId, packageId);
    }
}
