import {JWTCompact} from "./token-validator";

const validator = require('./token-validator')

const PUBLIC_KEY = process.env.PUBLIC_KEY

enum ValidationResponse {
    VALID = 'valid',
    INVALID = 'invalid'
}

export async function handler(token: JWTCompact) {
    console.log('TOKEN', JSON.stringify(token))

    if (!token) {
        throw new Error('Token must be provided.')
    }

    try {
        return await validator.validate(token, PUBLIC_KEY) === true
            ? ValidationResponse.VALID
            : ValidationResponse.INVALID

    } catch (e) {
        console.error('ERROR', e)
    }
    return ValidationResponse.INVALID
}