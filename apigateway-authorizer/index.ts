const jose = require('node-jose');

import {JSONWebKey} from './src/JSONWebKey';
import {TenantInfo, TenantInfoUtil} from './src/TenantInfoUtil';
import {PoliciesGenerator} from './src/PoliciesGenerator';

const jsonWebKey = new JSONWebKey();
const issHolder = new TenantInfoUtil();

const region = process.env.AWS_REGION;

exports.handler = function (event, context, callback) {
    handleRequest(event.authorizationToken, event.methodArn, callback);
};

function handleRequest(rawToken, methodArn, callback) {
    let splitToken = rawToken.split('Bearer');
    if (splitToken.length !== 2) {
        console.error("Token is not Bearer: " + rawToken);
        return unauthorized(callback);
    }
    const token = splitToken[1].trim();

    authorize(token, methodArn, callback);
}

function authorize(token, methodArn, callback) {
    try {
        let jwt = parseToken(token);

        issHolder.getTenantInfo(jwt.payload["custom:tenantId"])
            .then(tenantInfo => validateToken(jwt.payload, tenantInfo))
            .then(tenantInfo => jsonWebKey.getPublicKey(tenantInfo.userPoolId, region, jwt.header.kid))
            .then(publicKey => verifyToken(token, publicKey))
            .then(() => {
                let policiesGenerator = new PoliciesGenerator(jwt.payload.sub, methodArn);
                let response = policiesGenerator.generatePolicies(jwt.payload["custom:tenantId"], jwt.payload["custom:role"]);

                console.info("RESPONSE", JSON.stringify(response));
                callback(null, response);
            })
            .catch((reason) => {
                console.error("Cannot validate a token: " + reason);
                unauthorized(callback);
            });

    } catch (e) {
        unauthorized(callback);
    }
}

function unauthorized(callback) {
    callback("Unauthorized");
}

class JWT {
    header: any;
    payload: any;
}

function parseToken(token: string): JWT {
    try {
        let jwt = new JWT();
        let sections = token.split('.');
        jwt.header = JSON.parse(jose.util.base64url.decode(sections[0]));
        jwt.payload = JSON.parse(jose.util.base64url.decode(sections[1]));
        return jwt;

    } catch (e) {
        throw new Error("Cannot parser a token: " + token);
    }
}

function validateToken(jwt: any, tenantInfo: TenantInfo): Promise<TenantInfo> {
    return new Promise((success, reject) => {
        if (jwt.aud != tenantInfo.clientId) {
            reject("wrong client id: " + jwt.aud);
        }
        if (jwt.token_use != 'id') {
            reject("wrong token_use: " + jwt.token_use);
        }
        if (jwt.exp < Math.floor(Date.now() / 1000)) {
            reject("token expired: " + jwt.exp);
        }
        success(tenantInfo);
    });
}

function verifyToken(token: string, publicKey: any): Promise<object> {
    return new Promise((success, reject) => {
        jose.JWS.createVerify(publicKey).verify(token).then(function (result) {
            success(result);
        }).catch((reason) => {
            reject(reason);
        });
    });
}
