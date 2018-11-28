import {Lambda} from 'aws-sdk'
import * as fs from 'fs'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe("Authorizer Test", function () {

    const AUTHORIZER_LAMBDA = process.env.AUTHORIZER_LAMBDA

    const tokenValid = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiIwMGFlOTQ1MC1lZGE4LTExZTgtOGMzNi0wZmExYjkxOTc1ZjQiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTMwNDUsImF1dGhfdGltZSI6MTU0MjgxMzA0NSwiZXhwIjo3NTQyODEzMDQ1LCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.jUoFtkelvrzW3I5y7FWl4dxXZyltaMTtL-yTtB_1tScoUw82tkEhRaDcmnTTvKDPI7_ofr27Gv0v-jYWTupyrHaiV0QilxYfPJSUwQdxzRj-GezL9dj_1wrzT8HEzaYdeQ5HHe3sAnnwdlCGba-hnlK5SSxZNVps7QIQk0LrlqE6YOTEFWXYhooeAIqvbFBeLaECaVJPHfmqxerHwpDyYUYMr6Lme1j3phJ-KBW0UrNToWPCzD5cflGYrbhhj6lp5AzYVz1lzubdI_MKVXh-hHyux-bv-xsvcMU6Vdjz8Qvm-wz0OGOU9Q5xIS8XeQ05j77bBZmhLCcODkhgjvYcvw'
    const tokenInvalid = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiIxMTAzYTNlMC1lZGE4LTExZTgtODI4NC1hOTZiMTgxODcyMjkiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTMwNzMsImF1dGhfdGltZSI6MTU0MjgxMzA3MywiZXhwIjoxNTQyODEzMTMzLCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.N_juNzKz9M1Dr7Dffn5UDyUE9hKtV3H8TBUBL8_QDu1lsG3dhwrmNOQCrY5BIJzaVq4z5js6JvjS-kie11p08Z_vkuDv5uKuL3KBSqAGHrckeJxL7GfCzNvdzVUt2-grKzVqd6KXfXCDGNWTiotUEvVl1IX74e3UNK8uZbGke0loaBn0QMIGoCZtsb5kAx9X-rEvI6Y1mMvQUoB9aRvyfXQ53Iz2wRVEzqMl94XOg13BaVrAVWBVzbVUgasLf2rJ8zNGtdsYNeDtkL7oWU4MupSwN3EpZL-igPRB_mMus_Ae6982KGDJIpHv7bh_BOHvxLFTRCA5VFB6jdaRwa8sLQ'

    it('AuthResponse must be provided for a valid token', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/authorizer-request.json', 'utf8')
                .replace('$$TOKEN$$', tokenValid)
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: AUTHORIZER_LAMBDA, Payload: req}).promise()

            expect(res).toBeDefined()
            expect(res.StatusCode).toBe(200)
            expect(res.Payload).toBeDefined()

            const payload = JSON.parse(res.Payload.toString())

            expect(payload.principalId).toBeDefined()
            expect(payload.usageIdentifierKey).toBeDefined()
            expect(payload.policyDocument).toBeDefined()
            expect(payload.context).toBeDefined()

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('"Unauthorized" response must not be provided for an invalid token', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/authorizer-request.json', 'utf8')
                .replace('$$TOKEN$$', tokenInvalid)
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: AUTHORIZER_LAMBDA, Payload: req}).promise()

            expect(res).toBeDefined()
            expect(res.StatusCode).toBe(200)
            expect(res.Payload).toBeDefined()
            expect(res.Payload).toBe('Unauthorized')

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('"Unauthorized" response must not be provided for a malformed token', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/authorizer-request.json', 'utf8')
                .replace('$$TOKEN$$', 'JUNK')
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: AUTHORIZER_LAMBDA, Payload: req}).promise()

            expect(res).toBeDefined()
            expect(res.StatusCode).toBe(200)
            expect(res.Payload).toBeDefined()
            expect(res.Payload).toBe('Unauthorized')

            done()
        } catch (e) {
            done.fail(e)
        }
    })
})

