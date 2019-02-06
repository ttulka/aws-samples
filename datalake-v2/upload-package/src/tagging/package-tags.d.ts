export interface PackageTags {
    saveTags(tenantId: string, packageId: string, tags: Tag[]): Promise<void>
}

export interface Tag {
    key: string;
    value: string
}