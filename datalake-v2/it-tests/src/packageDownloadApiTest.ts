import {Lambda} from 'aws-sdk';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;
const DOWNLOAD_PACKAGE_LAMBDA = process.env.DOWNLOAD_PACKAGE_LAMBDA;

describe("Package download via API.", () => {

    let packageId: string;
    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId();

        const event = require('./resources/apiEventDownloadPackage.json');
        event.pathParameters['id'] = packageId;

        console.info('Download a package...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
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

    it("Response payload should be a valid HTTP response.", () => {
        const httpResponse = JSON.parse(response.Payload.toString());
        expect(httpResponse.statusCode).toBe(200);
        expect(httpResponse.headers).toBeDefined();
        expect(httpResponse.body).toBeDefined();
    });

    it("Response payload should contain valid HTTP headers.", () => {
        const headers = JSON.parse(response.Payload.toString()).headers;
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it("Response payload should contain a valid body.", () => {
        const body = JSON.parse(JSON.parse(response.Payload.toString()).body);
        expect(body.packageId).toBe(packageId);
        expect(body.tenantId).toBe('TEST');
        expect(body.type).toBe('test');
        expect(body.contentType).toBe('application/test');
        expect(body.tags).toBeDefined();
        expect(body.tags.length).toBe(2);

        expect(body.createdAt).toBeDefined();
        expect(body.downloadUrl).toBeDefined();

        expect(body.downloadUrl).not.toContain('response-content-disposition=true');
    });
});

describe("Package with RCD download via API.", () => {

    let packageId: string;
    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId();

        const event = require('./resources/apiEventDownloadPackageWithRCD.json');
        event.pathParameters['id'] = packageId;

        console.info('Download a package with RCD=true...');
        response = await lambda.invoke({
            FunctionName: DOWNLOAD_PACKAGE_LAMBDA,
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

    it("Response payload should be a valid HTTP response.", () => {
        const httpResponse = JSON.parse(response.Payload.toString());
        expect(httpResponse.statusCode).toBe(200);
        expect(httpResponse.headers).toBeDefined();
        expect(httpResponse.body).toBeDefined();
    });

    it("Response payload should contain valid HTTP headers.", () => {
        const headers = JSON.parse(response.Payload.toString()).headers;
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it("Response payload should contain a valid body with RCD.", () => {
        const body = JSON.parse(JSON.parse(response.Payload.toString()).body);
        expect(body.packageId).toBe(packageId);
        expect(body.tenantId).toBe('TEST');
        expect(body.type).toBe('test');
        expect(body.contentType).toBe('application/test');
        expect(body.tags).toBeDefined();
        expect(body.tags.length).toBe(2);

        expect(body.createdAt).toBeDefined();
        expect(body.downloadUrl).toBeDefined();

        expect(body.downloadUrl).toContain('response-content-disposition=true');
    });
});

async function uploadedPackageId() {
    const response = await lambda.invoke({
        FunctionName: UPLOAD_PACKAGE_LAMBDA,
        Payload: JSON.stringify(require('./resources/apiEventUploadPackage.json'))
    } as Lambda.Types.InvocationRequest).promise();

    // tagging can take some time
    await sleep(10);

    return JSON.parse(JSON.parse(response.Payload.toString()).body).packageId;
}

function sleep(secs) {
    return new Promise((resolve) => setTimeout(resolve, secs * 1000))
}