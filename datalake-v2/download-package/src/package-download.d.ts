export interface DownloadRequest {
    packageId: string;
    tenantId: string;
    responseContentDisposition: string;
}

export interface DownloadResponse {
    packageId: string;
    tenantId: string;
    createdAt: string;
    type: string;
    contentType: string;
    tags?: { key: string; value: string }[];
    downloadUrl: string;
}