import {APIGatewayEvent} from 'aws-lambda'
import {FakeUserIdProvider} from 'fake-user-idprovider'

const tokenProvider = require('./token-provider')

const PRIVATE_KEY = process.env.PRIVATE_KEY
const OPENID_PROVIDER_URL = process.env.OPENID_PROVIDER_URL

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

    try {
        const [userId, password] = tokenProvider.credentialsFromBase64(event.headers.Authorization.split(' ')[1])
        const token = await tokenProvider.token(userId, password, PRIVATE_KEY, new FakeUserIdProvider())

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