import {Lambda} from 'aws-sdk';
import {PackageTags, Tag} from './package-tags.d';

export class DlPackageTags implements PackageTags {

    constructor(private readonly TAGGING_LAMBDA, private lambda: Lambda) {
    }

    async tags(tenantId: string, packageId: string): Promise<Tag[]> {
        const response: Lambda.Types.InvocationResponse = await this.lambda.invoke({
            FunctionName: this.TAGGING_LAMBDA,
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: JSON.stringify({
                method: 'GET',
                payload: {
                    tenantId,
                    packageId
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        const payload = response.Payload ? JSON.parse(response.Payload.toString()) : {};
        return payload.tags && payload.tags.length
            ? payload.tags
                .map(item => ({key: item.key, value: item.value}))
            : [];
    }
}