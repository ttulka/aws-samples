import {Lambda} from 'aws-sdk';
import {S3Event} from 'aws-lambda';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;
const PUBLISH_PACKAGE_LAMBDA = process.env.PUBLISH_PACKAGE_LAMBDA;

describe("Package publish.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        const packageId = await uploadedPackageId();

        const event: S3Event = require('./resources/s3ObjectCreated.json');
        event.Records[0].s3.object.key = `${packageId.substr(0, 8)}/TEST/${packageId}`;

        console.info('Publish a package...');
        response = await lambda.invoke({
            FunctionName: PUBLISH_PACKAGE_LAMBDA,
            Payload: JSON.stringify(event)
        } as Lambda.Types.InvocationRequest).promise();
        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("Response payload should be 'success'.", () => {
        expect(JSON.parse(response.Payload.toString())).toBe('success');
    });
});

async function uploadedPackageId() {
    const response = await lambda.invoke({
        FunctionName: UPLOAD_PACKAGE_LAMBDA,
        Payload: JSON.stringify({
            tenantId: 'TEST',
            type: 'test',
            contentType: 'application/test'
        })
    } as Lambda.Types.InvocationRequest).promise();

    return JSON.parse(response.Payload.toString()).packageId;
}