import {Lambda} from 'aws-sdk';
import {PackageId, PackageTags, Tag} from './package-tags.d';

export class DlPackageTags implements PackageTags {

    constructor(private readonly TAGGING_LAMBDA, private lambda: Lambda) {
    }

    async packagesForTags(tenantId: string, tags: Tag[]): Promise<PackageId[]> {
        const response = await this.lambda.invoke({
            FunctionName: this.TAGGING_LAMBDA,
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: JSON.stringify({
                method: 'SEARCH',
                payload: {
                    tenantId,
                    tags
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        const payload = response.Payload ? JSON.parse(response.Payload.toString()) : {};
        return payload.packageIds && payload.packageIds.length
            ? payload.packageIds
                .map(item => item.packageId as PackageId)
            : [];
    }
}