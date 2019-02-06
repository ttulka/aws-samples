import {Lambda} from 'aws-sdk';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;
const DOWNLOAD_PACKAGE_LAMBDA = process.env.DOWNLOAD_PACKAGE_LAMBDA;

describe("Package download via invocation.", () => {

    let packageId: string;
    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId();

        console.info('Download a package...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                packageId,
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("Response payload should be set.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.packageId).toBe(packageId);
        expect(payload.tenantId).toBe('TEST');
        expect(payload.type).toBe('test');
        expect(payload.contentType).toBe('application/test');
        expect(payload.tags).toBeDefined();
        expect(payload.tags.length).toBe(2);

        expect(payload.createdAt).toBeDefined();
        expect(payload.downloadUrl).toBeDefined();

        expect(payload.downloadUrl).not.toContain('response-content-disposition=true');
    });
});

describe("Package with RCD download via invocation.", () => {

    let packageId: string;
    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId();

        console.info('Download a package with RCD=true...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                packageId,
                tenantId: 'TEST',
                responseContentDisposition: true
            })
        } as Lambda.Types.InvocationRequest).promise();

        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("RCD Response payload attributes should be.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.packageId).toBe(packageId);
        expect(payload.tenantId).toBe('TEST');
        expect(payload.type).toBe('test');
        expect(payload.contentType).toBe('application/test');
        expect(payload.tags).toBeDefined();
        expect(payload.tags.length).toBe(2);

        expect(payload.createdAt).toBeDefined();
        expect(payload.downloadUrl).toBeDefined();

        expect(payload.downloadUrl).toContain('response-content-disposition=true');
    });
});

describe("Package with no packageId download via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Download a package...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                //packageId: 'test',
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();

        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("Response payload should be error.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.errorType).toBe('Error');
        expect(payload.errorMessage).toContain('packageId');
    });
});

describe("Package with no tenantId download via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Download a package...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                packageId: 'test',
                //tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();

        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("Response payload should be error.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.errorType).toBe('Error');
        expect(payload.errorMessage).toContain('tenantId');
    });
});

async function uploadedPackageId() {
    const response = await lambda.invoke({
        FunctionName: UPLOAD_PACKAGE_LAMBDA,
        Payload: JSON.stringify({
            tenantId: 'TEST',
            type: 'test',
            contentType: 'application/test',
            tags: [{
                key: 'tag1',
                value: 'value1'
            }, {
                key: 'tag2',
                value: 'value2'
            }]
        })
    } as Lambda.Types.InvocationRequest).promise();

    // tagging can take some time
    await sleep(10);

    return JSON.parse(response.Payload.toString()).packageId;
}

function sleep(secs) {
    return new Promise((resolve) => setTimeout(resolve, secs * 1000))
}