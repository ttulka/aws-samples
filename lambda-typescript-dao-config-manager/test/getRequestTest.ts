describe("Create prepareRequest", function () {
    const runner = require('./helpers/requestRunner');
    const configRepo = require('./helpers/configRepository');

    var requestPayload;
    var response;
    var responsePayload;

    beforeAll((done) => {
        const addRequestedItemIntoDb = (req) => {
            requestPayload = {
                id: req.pathParameters.id,
                name: "Test"
            };
            return configRepo.addItem(
                requestPayload.id,
                requestPayload.name
            )
        };

        runner.prepareRequest('get-request')
            .then((req) => runner.enhanceRequest(req, addRequestedItemIntoDb))
            .then((req) => runner.processRequest(req))
            .then((res) => {
                response = res;
                responsePayload = JSON.parse(res.body);
                done();
            })
            .catch((reason) => {
                console.error("Error by processing", reason);
                throw new Error(reason);
            });
    });

    it("Response should be 200.", function () {
        expect(response.statusCode).toBe(200);
    });

    it("Response should contain data.", function () {
        expect(responsePayload.id).toEqual(requestPayload.id);
        expect(responsePayload.name).toEqual(requestPayload.name);
    });

    afterAll((done) => {
        configRepo.deleteItem(requestPayload.id)
            .then(() => done())
            .catch((reason) => {
                console.error("Error by cleaning up", reason);
                throw new Error(reason);
            });
    });
});

