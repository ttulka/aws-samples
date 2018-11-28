import {Lambda} from 'aws-sdk'
import * as fs from 'fs'

describe('App Token Test', function () {
    const lambda = new Lambda({apiVersion: '2015-03-31'})

    const APP_TOKEN_PROVIDER_LAMBDA = process.env.APP_TOKEN_PROVIDER_LAMBDA
    const APP_ID = process.env.APP_ID
    const APP_PASSWORD = process.env.APP_PASSWORD
    const APP_TENANT_ID = process.env.APP_TENANT_ID

    it('Token must be provided for an existing app', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/app-token-request.json', 'utf8')
                .replace('$$USER_ID$$', APP_ID)
                .replace('$$USER_PASSWORD$$', APP_PASSWORD)
                .replace('$$TENANT_ID$$', APP_TENANT_ID)
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: APP_TOKEN_PROVIDER_LAMBDA, Payload: req}).promise()

            expect(res).toBeDefined()
            expect(res.StatusCode).toBe(200)
            expect(res.Payload).toBeDefined()

            const payload = JSON.parse(res.Payload.toString())

            expect(payload.statusCode).toBe(200)
            expect(payload.body).toBeDefined()
            expect(JSON.parse(payload.body).token).toBeDefined()

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Token must not be provided for a non-existing user', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/app-token-request.json', 'utf8')
                .replace('$$USER_ID$$', 'junk')
                .replace('$$USER_PASSWORD$$', 'junk')
                .replace('$$TENANT_ID$$', 'junk')
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: APP_TOKEN_PROVIDER_LAMBDA, Payload: req}).promise()

            expect(res).toBeDefined()
            expect(res.StatusCode).toBe(200)
            expect(res.Payload).toBeDefined()

            const payload = JSON.parse(res.Payload.toString())

            expect(payload.statusCode).toBe(401)

            expect(payload.body).toBeDefined()
            expect(JSON.parse(payload.body).message).toBeDefined()

            done()
        } catch (e) {
            done.fail(e)
        }
    })
})
