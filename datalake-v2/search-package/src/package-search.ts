import {SearchRequest, SearchResponse} from './package-search.d';
import {PackageId, PackageTags, Tag} from './tagging/package-tags.d';

export class PackageSearch {

    constructor(private packageTags: PackageTags) {
    }

    async response({tenantId, tags}: SearchRequest): Promise<SearchResponse> {
        if (!tenantId) {
            throw new Error('\'tenantId\' is missing in the request.');
        }
        if (!tags) {
            throw new Error('\'tags\' is missing in the request.');
        }
        return (await this.packageIds(tenantId, tags))
            .map(packageId => ({packageId})) as SearchResponse

    }

    private async packageIds(tenantId: string, tags: Tag[]): Promise<PackageId[]> {
        return await this.packageTags.packagesForTags(tenantId, tags);
    }
}
