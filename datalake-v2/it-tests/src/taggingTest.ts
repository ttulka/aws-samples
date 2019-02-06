import {Lambda} from 'aws-sdk';
import * as uuidv1 from 'uuid/v1';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const lambda = new Lambda({apiVersion: '2015-03-31'});

const TAGGING_SERVICE_LAMBDA = process.env.TAGGING_SERVICE_LAMBDA;

describe("Tagging.", function () {

    const packageId = uuidv1();
    const value1 = uuidv1();
    const value2 = uuidv1();

    let createResponse: Lambda.Types.InvocationResponse;
    let searchSimpleResponse: Lambda.Types.InvocationResponse;
    let searchMultiResponse: Lambda.Types.InvocationResponse;
    let getResponse: Lambda.Types.InvocationResponse;
    let deleteResponse: Lambda.Types.InvocationResponse;
    let getAfterDeleteResponse: Lambda.Types.InvocationResponse;

    beforeAll(async done => {
        console.info('Creating tags...');
        createResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'CREATE',
                payload: {
                    tenantId: 'TEST',
                    packageId,
                    tags: [
                        {key: 'tag1', value: value1},
                        {key: 'tag2', value: value2}
                    ]
                }
            })
        } as Lambda.Types.InvocationRequest).promise();
        await sleep(5);  // indexing can take some time

        console.info('Searching simple tags...');
        searchSimpleResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'SEARCH',
                payload: {
                    tenantId: 'TEST',
                    tags: [
                        {key: 'tag1', value: value1}
                    ]
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        console.info('Searching multi tags...');
        searchMultiResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'SEARCH',
                payload: {
                    tenantId: 'TEST',
                    tags: [
                        {key: 'tag1', value: value1},
                        {key: 'tag2', value: value2}
                    ]
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        console.info('Getting tags...');
        getResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'GET',
                payload: {
                    tenantId: 'TEST',
                    packageId
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        console.info('Deleting tags...');
        deleteResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'DELETE',
                payload: {
                    tenantId: 'TEST',
                    packageId
                }
            })
        } as Lambda.Types.InvocationRequest).promise();
        await sleep(5);  // re-indexing can take some time

        console.info('Getting deleted tags...');
        getAfterDeleteResponse = await lambda.invoke({
            FunctionName: TAGGING_SERVICE_LAMBDA,
            Payload: JSON.stringify({
                method: 'GET',
                payload: {
                    tenantId: 'TEST',
                    packageId
                }
            })
        } as Lambda.Types.InvocationRequest).promise();

        done();
    });

    it("Response status code should be OK.", () => {
        expect(createResponse.StatusCode).toBe(200);
        expect(searchSimpleResponse.StatusCode).toBe(200);
        expect(searchMultiResponse.StatusCode).toBe(200);
        expect(getResponse.StatusCode).toBe(200);
        expect(deleteResponse.StatusCode).toBe(200);
        expect(getAfterDeleteResponse.StatusCode).toBe(200);
    });

    it("Response payload should be set.", () => {
        expect(createResponse.Payload).toBeDefined();
        expect(searchSimpleResponse.Payload).toBeDefined();
        expect(searchMultiResponse.Payload).toBeDefined();
        expect(getResponse.Payload).toBeDefined();
        expect(deleteResponse.Payload).toBeDefined();
        expect(getAfterDeleteResponse.Payload).toBeDefined();
    });

    it("Create response payload should be true.", () => {
        expect(JSON.parse(createResponse.Payload.toString())).toBe(true);
    });

    // TODO enable this test when searching works again
    // it("Search simple response payload should contain the packageId.", () => {
    //     const payload = JSON.parse(searchSimpleResponse.Payload.toString());
    //
    //     expect(payload.packageIds).toBeDefined();
    //     expect(Array.isArray(payload.packageIds)).toBe(true);
    //     expect(payload.packageIds.length).toBe(1);
    //
    //     expect(payload.packageIds[0]).toBe(packageId);
    // });
    //
    // it("Search multi response payload should contain the packageId.", () => {
    //     const payload = JSON.parse(searchMultiResponse.Payload.toString());
    //
    //     expect(payload.packageIds).toBeDefined();
    //     expect(Array.isArray(payload.packageIds)).toBe(true);
    //     expect(payload.packageIds.length).toBe(1);
    //
    //     expect(payload.packageIds[0]).toBe(packageId);
    // });

    it("Get response payload should contain tags.", () => {
        const payload = JSON.parse(getResponse.Payload.toString());

        expect(payload.tags).toBeDefined();
        expect(Array.isArray(payload.tags)).toBe(true);
        expect(payload.tags.length).toBe(2);

        expect(payload.tags[0].key).toBe('tag1');
        expect(payload.tags[0].value).toBe(value1);
        expect(payload.tags[1].key).toBe('tag2');
        expect(payload.tags[1].value).toBe(value2);
    });

    it("Delete response payload should return one deleted item.", () => {
        expect(JSON.parse(deleteResponse.Payload.toString())).toBe(1);
    });

    it("Get after delete response payload should contain no tags.", () => {
        const payload = JSON.parse(getAfterDeleteResponse.Payload.toString());

        expect(payload.tags).toBeDefined();
        expect(Array.isArray(payload.tags)).toBe(true);
        expect(payload.tags.length).toBe(0);
    });
});

function sleep(secs) {
    return new Promise((resolve) => setTimeout(resolve, secs * 1000))
}