import {APIGatewayEvent} from 'aws-lambda'
import {FakeAppIdProviderByUser} from "./fake-app-idprovider-by-user";
import {FakeAppIdProviderByTenant} from "./fake-app-idprovider-by-tenant";

const tokenProvider = require('./token-provider')

const PRIVATE_KEY = process.env.PRIVATE_KEY

export async function handler(event: APIGatewayEvent) {
    console.log('EVENT', JSON.stringify(event))

    if (event.httpMethod !== 'GET') {
        return buildResponse(405, 'Only GET method is allowed.')
    }
    if (!event.headers.Authorization) {
        return buildResponse(400, '"Authorization" header must be set.')
    }
    if (!event.headers.Authorization.startsWith('Basic')) {
        return buildResponse(400, 'Only "Basic" authorization is supported.')
    }
    if (!event.queryStringParameters || (!event.queryStringParameters.user && !event.queryStringParameters.tenant)) {
        return buildResponse(405, '"user" or "tenant" query parameter must be set.')
    }

    const userId: string = event.queryStringParameters.user
    const tenantId: string = event.queryStringParameters.tenant

    try {
        const [appId, password] = tokenProvider.credentialsFromBase64(event.headers.Authorization.split(' ')[1])
        const token = userId
            ? await tokenProvider.token(appId, password, userId, PRIVATE_KEY, new FakeAppIdProviderByUser())
            : await tokenProvider.token(appId, password, tenantId, PRIVATE_KEY, new FakeAppIdProviderByTenant())

        return buildResponse(200, {token})

    } catch (e) {
        console.error('ERROR', e)
        return buildResponse(401, e)
    }
}

function buildResponse(statusCode: number, data: any) {
    return {
        isBase64Encoded: false,
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeof data === 'object' ? data : {message: data})
    };
}