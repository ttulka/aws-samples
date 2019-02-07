export interface PackageEntries {
    packageEntry(tenantId: string, packageId: string): Promise<PackageEntry>
}

export interface PackageEntry {
    packageId: string;
    tenantId: string;
    name: string;
    type: string;
    contentType: string;
    bucket: string;
    objectKey: string;
    createdAt: string;
}