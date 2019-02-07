export interface PackageStorage {
    packageObject(bucket: string, objectKey: string): PackageObject;
}

export interface PackageObject {
    downloadUrl(): string;
}