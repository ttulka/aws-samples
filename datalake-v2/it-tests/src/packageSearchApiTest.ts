import {Lambda} from 'aws-sdk';
import * as uuidv1 from 'uuid/v1';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;
const SEARCH_PACKAGE_LAMBDA = process.env.SEARCH_PACKAGE_LAMBDA;

describe("Package search via API.", () => {

    const tagValue = uuidv1();

    let packageId: string;
    let response: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId(tagValue + '_1', tagValue + '_2');

        const event = require('./resources/apiEventSearchPackage.json');
        event.body = JSON.stringify({
            tags: [{
                key: 'tag1',
                value: tagValue + '_1'
            }, {
                key: 'tag2',
                value: tagValue + '_2'
            }]
        });
        console.info('Search a package...');
        response = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
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

    // TODO enable this test when searching works again
    // it("Response payload should contain a valid body with search results.", () => {
    //     const body = JSON.parse(JSON.parse(response.Payload.toString()).body);
    //     expect(Array.isArray(body)).toBe(true);
    //     expect(body.length).toBe(1);
    //     expect(body[0].packageId).toBe(packageId);
    // });
});

async function uploadedPackageId(tag1, tag2) {
    const event = {
        ...require('./resources/apiEventUploadPackage.json'),
        body: JSON.stringify({
            tags: [{
                key: 'tag1',
                value: tag1
            }, {
                key: 'tag2',
                value: tag2
            }]
        })
    };
    const response = await lambda.invoke({
        FunctionName: UPLOAD_PACKAGE_LAMBDA,
        Payload: JSON.stringify(event)
    } as Lambda.Types.InvocationRequest).promise();

    // tagging can take some time
    await sleep(10);

    return JSON.parse(JSON.parse(response.Payload.toString()).body).packageId;
}

function sleep(secs) {
    return new Promise((resolve) => setTimeout(resolve, secs * 1000))
}