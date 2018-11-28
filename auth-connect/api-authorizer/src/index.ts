import {CustomAuthorizerEvent} from 'aws-lambda'
import {Lambda} from 'aws-sdk'
import {PoliciesGenerator, AuthResponse} from './PoliciesGenerator'

const lambda: Lambda = new Lambda({apiVersion: '2015-03-31'})
const jose = require('node-jose')

const TOKEN_VALIDATOR_LAMBDA = process.env.TOKEN_VALIDATOR_LAMBDA

enum EventType {
    TOKEN = 'TOKEN',
    REQUEST = 'REQUEST'
}

type JWT = {
    header: any;
    payload: any;
}

export async function handler(event: CustomAuthorizerEvent) {
    const tokenString = extractToken(event)
    if (tokenString) {
        let splitToken = tokenString.split('Bearer')
        if (splitToken.length !== 2) {
            console.error("Token is not Bearer: " + event.authorizationToken)
            return unauthorized()
        }
        const token = splitToken[1].trim()

        try {
            const valid = await validate(token)
            if (!valid) {
                console.warn('Invalid token', token)
                return unauthorized()
            }

            return await authorize(token, event.methodArn)

        } catch (e) {
            console.error('Cannot authorize the token', token, JSON.stringify(e))
        }
    } else {
        console.error('"authorizationToken" or queryStringParameters["token"] is not in the event.', JSON.stringify(event))
    }
    return unauthorized()
}

function extractToken(event: CustomAuthorizerEvent) {
    if (event.type == EventType.TOKEN) {
        return event.authorizationToken
    } else if (event.type == EventType.REQUEST && event.queryStringParameters) {
        return event.queryStringParameters['token']
    }
    throw new Error('Could not find a token in the request! ' + JSON.stringify(event))
}

async function validate(token: string): Promise<boolean> {
    const params: Lambda.Types.InvocationRequest = {
        FunctionName: TOKEN_VALIDATOR_LAMBDA,
        Payload: JSON.stringify(token)
    }
    const res: Lambda.Types.InvocationResponse = await lambda.invoke(params).promise()
    return res && !res.FunctionError && res.StatusCode === 200 && JSON.parse(res.Payload.toString()) === 'valid'
}

async function authorize(token: string, methodArn: string): Promise<AuthResponse> {
    const jwt = parseToken(token)
    const tenantId = jwt.payload.tenantId

    return new PoliciesGenerator(jwt.payload.sub, methodArn)
        .generateAuthResponse(tenantId, findRole(jwt.payload), token)
}

function findRole(payload: {[name: string]: string}): string {
    if (payload.role) {
        return payload.role
    }
    if (payload['custom:role']) {
        return payload['custom:role']
    }
    return 'service' // default role
}

function unauthorized() {
    return 'Unauthorized'
}

function parseToken(token: string): JWT {
    try {
        let jwt: JWT = {header: undefined, payload: undefined}
        let sections = token.split('.')
        jwt.header = JSON.parse(jose.util.base64url.decode(sections[0]))
        jwt.payload = JSON.parse(jose.util.base64url.decode(sections[1]))
        return jwt

    } catch (e) {
        throw new Error("Cannot parser a token: " + token)
    }
}