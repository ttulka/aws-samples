export interface PackageEntries {
    savedPackageEntry(packageData: PackageData): Promise<PackageEntry>
}

export interface PackageData {
    tenantId: string;
    type: string;
    contentType: string;
}

export interface PackageEntry extends PackageData {
    packageId: string;
    bucket: string;
    objectKey: string;
}