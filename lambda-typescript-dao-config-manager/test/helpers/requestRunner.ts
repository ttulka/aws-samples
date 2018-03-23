export function prepareRequest(jsonFile) {
    return new Promise((resolve: (request) => void, reject) => {
        require('fs').readFile('./resources/test/' + jsonFile + '.json', (err, data) => {
            if (err) {
                reject("Cannot read the json resource " + jsonFile);

            } else {
                let requestEvent = JSON.parse(data);
                resolve(requestEvent);
            }
        });
    });
}

export function enhanceRequest(request, enhance: (request) => Promise<any>) {
    return new Promise((resolve: (req) => void, reject) => {
        enhance(request)
            .then(() => resolve(request))
            .catch((reason) => reject(reason));
    });
}

export function processRequest(request) {
    return new Promise((resolve: (response) => void, reject) => {
        let handler = require('../../index.ts').handler;

        handler(request, null, (err, data) => {
            if (err) {
                reject("ERROR: " + JSON.stringify(err));

            } else {
                console.info("RESPONSE", data);
                resolve(data);
            }
        });
    });
}