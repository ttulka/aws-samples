import {Lambda} from 'aws-sdk';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;

describe("Package with tags upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
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
        done();
    });

    it("Response status code should be OK.", () => {
        expect(response.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(response.Payload).toBeDefined();
    });

    it("Response payload attributes should be set.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.packageId).toBeDefined();
        expect(payload.uploadUrl).toBeDefined();
    });
});

describe("Package with no tags upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tenantId: 'TEST',
                type: 'test',
                contentType: 'application/test'
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

    it("Response payload attributes should be set.", () => {
        const payload = JSON.parse(response.Payload.toString());
        expect(payload.packageId).toBeDefined();
        expect(payload.uploadUrl).toBeDefined();
    });
});

describe("Package with no tenantId upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                //tenantId: 'TEST',
                type: 'test',
                contentType: 'application/test'
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

describe("Package with no type upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tenantId: 'TEST',
                //type: 'test',
                contentType: 'application/test'
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
        expect(payload.errorMessage).toContain('type');
    });
});

describe("Package with no contentType upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tenantId: 'TEST',
                type: 'test',
                //contentType: 'application/test'
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
        expect(payload.errorMessage).toContain('contentType');
    });
});

describe("Empty package upload via invocation.", () => {

    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        response = await lambda.invoke({
            FunctionName: UPLOAD_PACKAGE_LAMBDA,
            Payload: undefined
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
        expect(payload.errorMessage).toBeDefined();
    });
});