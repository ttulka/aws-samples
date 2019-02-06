export interface PackageTags {
    tags(tenantId: string, packageId: string): Promise<Tag[]>
}

export interface Tag {
    key: string;
    value: string
}