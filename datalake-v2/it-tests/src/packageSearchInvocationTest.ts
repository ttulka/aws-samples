import {Lambda} from 'aws-sdk';
import * as uuidv1 from 'uuid/v1';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const UPLOAD_PACKAGE_LAMBDA = process.env.UPLOAD_PACKAGE_LAMBDA;
const SEARCH_PACKAGE_LAMBDA = process.env.SEARCH_PACKAGE_LAMBDA;

describe("Package search via invocation.", () => {

    const tagValue = uuidv1();

    let packageId: string;
    let searchByTag1Response: Lambda.Types.InvocationResponse;
    let searchByTag2Response: Lambda.Types.InvocationResponse;
    let searchByBothTagsResponse: Lambda.Types.InvocationResponse;
    let searchByWrongValueResponse: Lambda.Types.InvocationResponse;
    let searchByWrongKeyResponse: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Update a package...');
        packageId = await uploadedPackageId(tagValue + '_1', tagValue + '_2');

        console.info('Search a package...');
        searchByTag1Response = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tags: [
                    {key: 'tag1', value: tagValue + '_1'}
                ],
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        searchByTag2Response = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tags: [
                    {key: 'tag2', value: tagValue + '_2'}
                ],
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        searchByBothTagsResponse = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tags: [
                    {key: 'tag1', value: tagValue + '_1'},
                    {key: 'tag2', value: tagValue + '_2'}
                ],
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        searchByWrongValueResponse = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tags: [
                    {key: 'tag1', value: tagValue + '_XXX'}
                ],
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        searchByWrongKeyResponse = await lambda.invoke({
            FunctionName: SEARCH_PACKAGE_LAMBDA,
            Payload: JSON.stringify({
                tags: [
                    {key: 'tagXXX', value: tagValue + '_1'}
                ],
                tenantId: 'TEST'
            })
        } as Lambda.Types.InvocationRequest).promise();
        done();
    });

    it("Response status code should be OK.", () => {
        expect(searchByTag1Response.StatusCode).toBe(200);
        expect(searchByTag2Response.StatusCode).toBe(200);
        expect(searchByBothTagsResponse.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(searchByTag1Response.Payload).toBeDefined();
        expect(searchByTag2Response.Payload).toBeDefined();
        expect(searchByBothTagsResponse.Payload).toBeDefined();
    });

    // TODO enable this test when searching works again
    // it("Response payload attributes should be set.", () => {
    //     const payload1 = JSON.parse(searchByTag1Response.Payload.toString());
    //     expect(Array.isArray(payload1)).toBe(true);
    //     expect(payload1.length).toBe(1);
    //     expect(payload1[0].packageId).toBe(packageId);
    //
    //     const payload2 = JSON.parse(searchByTag2Response.Payload.toString());
    //     expect(Array.isArray(payload2)).toBe(true);
    //     expect(payload2.length).toBe(1);
    //     expect(payload2[0].packageId).toBe(packageId);
    //
    //     const payload12 = JSON.parse(searchByBothTagsResponse.Payload.toString());
    //     expect(Array.isArray(payload12)).toBe(true);
    //     expect(payload12.length).toBe(1);
    //     expect(payload12[0].packageId).toBe(packageId);
    // });

    it("Response payload attributes should not be set for a wrong request.", () => {
        const payload1 = JSON.parse(searchByWrongValueResponse.Payload.toString());
        expect(Array.isArray(payload1)).toBe(true);
        expect(payload1.length).toBe(0);

        const payload2 = JSON.parse(searchByWrongKeyResponse.Payload.toString());
        expect(Array.isArray(payload2)).toBe(true);
        expect(payload2.length).toBe(0);
    });
});

async function uploadedPackageId(tag1, tag2) {
    const response = await lambda.invoke({
        FunctionName: UPLOAD_PACKAGE_LAMBDA,
        Payload: JSON.stringify({
            tenantId: 'TEST',
            type: 'test',
            contentType: 'application/test',
            tags: [{
                key: 'tag1',
                value: tag1
            }, {
                key: 'tag2',
                value: tag2
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