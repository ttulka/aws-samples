import {AppIdentityProvider, UserInfo} from "./app-identity-provider"

export type AppIdType = string
export type PasswordType = string
export type JWTCompact = string

const ISSUER = process.env.ISSUER || 'talisker-auth-connect'
const AUDIENCE = process.env.AUDIENCE || 'talisker-client'

const EXPIRE_IN_MINUTES = parseInt(process.env.EXPIRE_IN_MINUTES) || 120

const jose = require('node-jose')
const uuidv1 = require('uuidv1')

export function credentialsFromBase64(base64: string): [AppIdType, PasswordType] {
    const decoded = jose.util.base64url.decode(base64).toString('utf8').trim()
    const separatorPosition = decoded.indexOf(':')
    if (separatorPosition <= 0) {
        console.error('Cannot parse Basic Auth', decoded)
        throw new Error('Wrong username:password format')
    }
    return [decoded.substring(0, separatorPosition), decoded.substring(separatorPosition + 1)]
}

export async function token(appId: AppIdType, password: PasswordType, tenantId: string, privateKey: string, identityProvider: AppIdentityProvider): Promise<JWTCompact> {
    const userInfo: UserInfo = await identityProvider.authenticate(appId, password, tenantId)
    return await jwt(privateKey, ISSUER, AUDIENCE, appId, userInfo.tenantId)
}

async function jwt(key, iss, aud, appId, tenantId) {
    const now = time()
    const input = JSON.stringify({
        sub: uuidv1(),
        iss,
        aud,
        iat: now,
        auth_time: now,
        exp: time(EXPIRE_IN_MINUTES),
        appId,
        tenantId
    })
    return await jose.JWS.createSign({format: 'compact'}, await jose.JWK.asKey(key)).update(input).final()
}

function time(plusMinutes: number = 0) {
    return Math.floor((Date.now() + plusMinutes * 1000 * 60) / 1000)
}