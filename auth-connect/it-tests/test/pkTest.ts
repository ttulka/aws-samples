describe('PK Test', function () {
    const jose = require('node-jose')
    const fs = require('fs')

    var keystore

    it('Keystore should be set', async function(done) {
        try {
            const input = fs.readFileSync(__dirname + '/resources/test.jwks', 'utf8')
            keystore = await jose.JWK.asKeyStore(input)
            expect(keystore).toBeDefined()

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    var key

    it('There must be one key in the keystore', async function(done) {
        try {
            const keys = keystore.all()
            expect(keys).toBeDefined()
            expect(keys.length).toBe(1)

            key = keys[0]
            console.log('KEY PUBLIC', JSON.stringify(key.toJSON()))
            console.log('KEY PUBLIC+PRIVATE', JSON.stringify(key.toJSON(true)))
            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Key algorithm must be RSA', async function(done) {
        expect(key.kty).toBe('RSA')
        done()
    })

    var jwt

    it('Signature must be created as a JWT', async function(done) {
        try {
            const input = JSON.stringify({iss: 'myissuer', aud: 'myaudience'})
            jwt = await jose.JWS.createSign({format:'compact'}, key).update(input).final()
            console.log('JWT', jwt)
            expect(jwt).toBeDefined()

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    var token

    it('Token must be parsed', async function(done) {
        try {
            const sections = jwt.split('.');
            token = {
                header: JSON.parse(jose.util.base64url.decode(sections[0])),
                payload: JSON.parse(jose.util.base64url.decode(sections[1]))
            }
            expect(token).toBeDefined()
            console.log('TOKEN', token)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Verify must be successful for correct data', async function(done) {
        try {
            const res = await jose.JWS.createVerify(key).verify(jwt)
            expect(res).toBeDefined()

            const payload = JSON.parse(res.payload)
            expect(payload).toBeDefined()
            expect(payload.iss).toBe('myissuer')
            expect(payload.aud).toBe('myaudience')

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Verify must fail for incorrect data', async function(done) {
        try {
            await jose.JWS.createVerify(key).verify(jwt + 'junk')

            done.fail('wrong verification')
        } catch (e) {
            done()
        }
    })
})
