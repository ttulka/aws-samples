import {Lambda} from 'aws-sdk'
import * as fs from 'fs'

describe('User Token Test', function () {
    const lambda = new Lambda({apiVersion: '2015-03-31'})

    const USER_TOKEN_PROVIDER_LAMBDA = process.env.USER_TOKEN_PROVIDER_LAMBDA
    const USER_ID = process.env.USER_ID
    const USER_PASSWORD = process.env.USER_PASSWORD

    it('Token must be provided for an existing user', async function(done) {
        try {
            const req = fs.readFileSync(__dirname + '/resources/user-token-request.json', 'utf8')
                .replace('$$USER_ID$$', USER_ID)
                .replace('$$USER_PASSWORD$$', USER_PASSWORD)
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: USER_TOKEN_PROVIDER_LAMBDA, Payload: req}).promise()

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
            const req = fs.readFileSync(__dirname + '/resources/user-token-request.json', 'utf8')
                .replace('$$USER_ID$$', 'junk')
                .replace('$$USER_PASSWORD$$', 'junk')
            const res: Lambda.InvocationResponse = await lambda.invoke({
                FunctionName: USER_TOKEN_PROVIDER_LAMBDA, Payload: req}).promise()

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
