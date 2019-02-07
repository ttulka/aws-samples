export interface PublishRequest {
    bucket: string;
    objectKey: string;
}

export interface PackageEvent {
    tenantId: string;
    packageId: string;
    type: string;
    contentType: string;
    downloadUrl: string;
    createdAt: string;
}