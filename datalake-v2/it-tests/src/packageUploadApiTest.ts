import {Lambda} from 'aws-sdk';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;

describe("Package with tags upload via API.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify(require('./resources/apiEventUploadPackage.json'))
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
        expect(body.packageId).toBeDefined();
        expect(body.uploadUrl).toBeDefined();
    });
});

describe("Package with no tags upload via API.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify(require('./resources/apiEventUploadPackageNoTags.json'))
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
        expect(body.packageId).toBeDefined();
        expect(body.uploadUrl).toBeDefined();
    });
});