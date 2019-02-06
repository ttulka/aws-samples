export interface UploadRequest {
    tenantId: string;
    type: string;
    contentType: string;
    tags?: { key: string; value: string }[];
}

export interface UploadResponse {
    packageId: string;
    uploadUrl: string;
}