import {AuthResponse, PoliciesGenerator} from "../src/PoliciesGenerator";

describe('AuthResponse Test', function () {
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiIwMGFlOTQ1MC1lZGE4LTExZTgtOGMzNi0wZmExYjkxOTc1ZjQiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTMwNDUsImF1dGhfdGltZSI6MTU0MjgxMzA0NSwiZXhwIjo3NTQyODEzMDQ1LCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.jUoFtkelvrzW3I5y7FWl4dxXZyltaMTtL-yTtB_1tScoUw82tkEhRaDcmnTTvKDPI7_ofr27Gv0v-jYWTupyrHaiV0QilxYfPJSUwQdxzRj-GezL9dj_1wrzT8HEzaYdeQ5HHe3sAnnwdlCGba-hnlK5SSxZNVps7QIQk0LrlqE6YOTEFWXYhooeAIqvbFBeLaECaVJPHfmqxerHwpDyYUYMr6Lme1j3phJ-KBW0UrNToWPCzD5cflGYrbhhj6lp5AzYVz1lzubdI_MKVXh-hHyux-bv-xsvcMU6Vdjz8Qvm-wz0OGOU9Q5xIS8XeQ05j77bBZmhLCcODkhgjvYcvw'
    const sub = '00ae9450-eda8-11e8-8c36-0fa1b91975f4'  // from the token
    const tenantId = 'TEST-TENANT'  // from the token
    const methodArn = 'arn:aws:execute-api:eu-central-1:1234567890:xxxxxx/test/GET/myresource'

    it('AuthResponse should be set', function () {
        const response: AuthResponse = new PoliciesGenerator(sub, methodArn)
            .generateAuthResponse(tenantId, 'admin', token)

        expect(response).toBeDefined()
        expect(response.principalId).toBeDefined()
        expect(response.usageIdentifierKey).toBeDefined()
        expect(response.policyDocument).toBeDefined()
        expect(response.context).toBeDefined()
    })
})
