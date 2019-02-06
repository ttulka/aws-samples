export interface PackageTags {
    packagesForTags(tenantId: string, tags: Tag[]): Promise<PackageId[]>
}

export interface Tag {
    key: string;
    value: string
}

export type PackageId = string;