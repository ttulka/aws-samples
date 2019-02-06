export interface PackageEntries {
    packageEntry(tenantId: string, packageId: string): Promise<PackageEntry>
}

export interface PackageEntry {
    packageId: string;
    tenantId: string;
    createdAt: string;
    type: string;
    contentType: string;
    bucket: string;
    objectKey: string;
}