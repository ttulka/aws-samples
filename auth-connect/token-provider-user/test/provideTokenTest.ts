import {UserIdentityProvider, UserInfo} from '../src/user-identity-provider'
import * as fs from 'fs'

describe('Provide Token for Users Test', function () {
    const basicAuthBase64Decoded = 'dGVzdHVzZXI6VGVzdF9wYXNzdzByZCMhQA=='
    const testUserId = 'testuser'
    const testPassword = 'Test_passw0rd#!@'
    const testTenantId = 'TEST-TENANT'
    const testIssuer = 'test-issuer'
    const testAudience = 'test-audience'

    process.env.ISSUER = testIssuer
    process.env.AUDIENCE = testAudience

    const tokenProvider = require(__dirname + '/../src/token-provider.ts')

    it('Should get correct credentials from Base64', function () {
        const encoded = tokenProvider.credentialsFromBase64(basicAuthBase64Decoded)
        expect(encoded).toBeDefined()
        expect(encoded[0]).toBe(testUserId)
        expect(encoded[1]).toBe(testPassword)
    })

    const privateKey = JSON.parse(fs.readFileSync(__dirname + '/resources/private.key', 'utf8'))
    const publicKey = JSON.parse(fs.readFileSync(__dirname + '/resources/public.key', 'utf8'))
    var token

    it('Token must be provided', async function (done) {
        try {
            const jwt = await tokenProvider.token(testUserId, testPassword, privateKey, fakeIdentityProvider())
            expect(jwt).toBeDefined()
            token = jwt
            console.log('TOKEN', token)
            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Token must be correct', async function (done) {
        const jose = require('node-jose')
        try {
            const res = await jose.JWS.createVerify(await jose.JWK.asKey(publicKey)).verify(token)
            expect(res).toBeDefined()

            const payload = JSON.parse(res.payload)
            expect(payload).toBeDefined()
            expect(payload.sub).toBeDefined()
            expect(payload.iss).toBe(testIssuer)
            expect(payload.aud).toBe(testAudience)
            expect(payload.iat).toBeDefined()
            expect(payload.auth_time).toBeDefined()
            expect(payload.exp).toBeDefined()
            expect(payload.exp).toBeGreaterThan(Date.now() / 1000)
            expect(payload.tenantId).toBe(testTenantId)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    function fakeIdentityProvider(): UserIdentityProvider {
        return {
            async authenticate(userId: string, password: string): Promise<UserInfo> {
                return {
                    userId, 'custom:tenantId': testTenantId
                }
            }
        }
    }
})
