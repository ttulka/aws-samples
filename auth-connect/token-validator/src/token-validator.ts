export type JWTCompact = string

const ISSUER = process.env.ISSUER || 'talisker-auth-connect'
const AUDIENCE = process.env.AUDIENCE || 'talisker-client'

const jose = require('node-jose')

export async function validate(token: JWTCompact, publicKey: string) {
    try {
        const res = await jose.JWS.createVerify(await jose.JWK.asKey(publicKey)).verify(token)

        if (!res || !res.payload) {
            console.warn('Token has a wrong format', token)
            return false
        }

        const payload = JSON.parse(res.payload)

        if (!payload.sub) {
            console.warn('Subject must be set', payload.iss, JSON.stringify(payload))
            return false
        }
        if (payload.iss !== ISSUER) {
            console.warn('Issuer does not match', ISSUER, payload.iss, JSON.stringify(payload))
            return false
        }
        if (payload.aud !== AUDIENCE) {
            console.warn('Audience does not match', AUDIENCE, payload.aud, JSON.stringify(payload))
            return false
        }
        if (!payload.exp || payload.exp < Date.now() / 1000) {
            console.warn('Token is expired', JSON.stringify(payload))
            return false;
        }
        if (!payload.iat || payload.iat > Date.now() / 1000) {
            console.warn('Wrong issued time', JSON.stringify(payload))
            return false;
        }
        if (!payload.auth_time || payload.auth_time > Date.now() / 1000) {
            console.warn('Wrong authentication time', JSON.stringify(payload))
            return false;
        }
        return true

    } catch (e) {
        console.warn('Invalid token', token, e)
    }
    return false;
}