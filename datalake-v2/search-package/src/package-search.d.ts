export interface SearchRequest {
    tenantId: string;
    tags: { key: string; value: string }[]
}

export type SearchResponse = { packageId: string }[];