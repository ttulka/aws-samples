import {Lambda} from 'aws-sdk';
import {PackageTags, Tag} from './package-tags.d';

export class DlPackageTags implements PackageTags {

    constructor(private readonly TAGGING_LAMBDA, private lambda: Lambda) {
    }

    async saveTags(tenantId: string, packageId: string, tags: Tag[]): Promise<void> {
        await this.lambda.invoke({
            FunctionName: this.TAGGING_LAMBDA,
            InvocationType: 'Event',
            LogType: 'None',
            Payload: JSON.stringify({
                method: 'CREATE',
                payload: {
                    packageId,
                    tenantId,
                    tags
                }
            })
        } as Lambda.Types.InvocationRequest).promise();
    }
}