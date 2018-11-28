import * as fs from 'fs'

describe('Validate Token Test', function () {
    const tokenFutured = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiIwMGFlOTQ1MC1lZGE4LTExZTgtOGMzNi0wZmExYjkxOTc1ZjQiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTMwNDUsImF1dGhfdGltZSI6MTU0MjgxMzA0NSwiZXhwIjo3NTQyODEzMDQ1LCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.jUoFtkelvrzW3I5y7FWl4dxXZyltaMTtL-yTtB_1tScoUw82tkEhRaDcmnTTvKDPI7_ofr27Gv0v-jYWTupyrHaiV0QilxYfPJSUwQdxzRj-GezL9dj_1wrzT8HEzaYdeQ5HHe3sAnnwdlCGba-hnlK5SSxZNVps7QIQk0LrlqE6YOTEFWXYhooeAIqvbFBeLaECaVJPHfmqxerHwpDyYUYMr6Lme1j3phJ-KBW0UrNToWPCzD5cflGYrbhhj6lp5AzYVz1lzubdI_MKVXh-hHyux-bv-xsvcMU6Vdjz8Qvm-wz0OGOU9Q5xIS8XeQ05j77bBZmhLCcODkhgjvYcvw'
    const tokenExpired = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiIxMTAzYTNlMC1lZGE4LTExZTgtODI4NC1hOTZiMTgxODcyMjkiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTMwNzMsImF1dGhfdGltZSI6MTU0MjgxMzA3MywiZXhwIjoxNTQyODEzMTMzLCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.N_juNzKz9M1Dr7Dffn5UDyUE9hKtV3H8TBUBL8_QDu1lsG3dhwrmNOQCrY5BIJzaVq4z5js6JvjS-kie11p08Z_vkuDv5uKuL3KBSqAGHrckeJxL7GfCzNvdzVUt2-grKzVqd6KXfXCDGNWTiotUEvVl1IX74e3UNK8uZbGke0loaBn0QMIGoCZtsb5kAx9X-rEvI6Y1mMvQUoB9aRvyfXQ53Iz2wRVEzqMl94XOg13BaVrAVWBVzbVUgasLf2rJ8zNGtdsYNeDtkL7oWU4MupSwN3EpZL-igPRB_mMus_Ae6982KGDJIpHv7bh_BOHvxLFTRCA5VFB6jdaRwa8sLQ'
    const tokenWrongIssuer = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiJlZWU4YzE0MC1lZGE4LTExZTgtODJlMy1lMjgzM2U5YmMyMzkiLCJpc3MiOiJXUk9ORyEhISIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTM0NDUsImF1dGhfdGltZSI6MTU0MjgxMzQ0NSwiZXhwIjo3NTQyODEzNDQ1LCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.BfXZihE2BmGxDVpRPbJ6MgObuKXq1lGrig04vLsDVmZQnBF5U6pmX2AbLBwOEFa35lsiCqdPUXevqvCVlDol2EADsps9_sPGzOg3ngydKPE6Qp_NYJ9lCAJz1maD-VZlV-57zRYxHYhrJA9FdSRUE9qMTBoN9XZZL1624FgY1Zx94EbB8J3WG9hmNPoqHVQmRbu42G8Sy5QzVFPe4CNwfWGaWlfPiKFgw71CFUqK6b5KHFUGOiaqBi6UsUdv0V2qxqyT8UxQcRYGkydtAJ_I938iUqJhEgmt_XCSbaWZrPNoaao296bK7k3-3L6N48-lYao4WeVLHHTB_BH1A-HUNA'
    const tokenWrongAudience = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJzdWIiOiJmZDQzYWU4MC1lZGE4LTExZTgtOGRkZi0xODIxYTVjZDM4OWYiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6IldST05HISEhIiwiaWF0IjoxNTQyODEzNDY5LCJhdXRoX3RpbWUiOjE1NDI4MTM0NjksImV4cCI6NzU0MjgxMzQ2OSwidGVuYW50SWQiOiJURVNULVRFTkFOVCJ9.YC5O1a3fg7JzOv3EPQq6gPAtHLomZ9eildPLtyQXg4OFJa74UDRwnMBYapAPFXN5HHKYZjxSkT1RlY-3eRJQb2iSIKoz9QYbdK-o29-SovgSY00oOj015rjtDTM8qne9NPAMmQSFUJCPZ6B4iOwzNwHAtSKm0JMKmmNxRpCicf59YRr2i5KBAvZg1sU8BTLi7XCrM8gp6ZqjtDGq6-vegmyW-F14viy86M7W54AWKAD-Fq5tqAezZbQp2FqHQdb8aiJbTMdovX_NvX45fzpXxdbmLU7Wb9MecPmgjbTIfrwo9bgFEfFYn_AehPT2ZasbRrjhWUUXLXvfMWdYHmyW0Q'
    const tokenNoSubject = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkJuXzZ2T1lpZVY1cS1xaDJadzNhMXRMZVJoMFZaT1FkeWg4Tzc1OVhEZEUifQ.eyJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTM0MjAsImF1dGhfdGltZSI6MTU0MjgxMzQyMCwiZXhwIjo3NTQyODEzNDIwLCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.RaFmQfwqFAdtoCHzD4-U21MAROkyU1sGNm3aL1rDBZL8QBKaIYvxKb7_9OmlIC26DQgtwvKKiZMz4l685oAEdSszh2PocOxQhm7-xjxIW-2jqlMgQ9Rdf8Qf_CspeM15nHU5rWDy3_ENGRK3qynhymLwyd_nRiooS-j5CT3LphEN52GiCCdFmdt5r5nXFVsfqzIKbyT__zhPq5h9mQuCoPcYOIoR_6AJoG--i7NwQBiqkHLQeAh5TOipHwDl32h23IwDatOa-HNPiM5_3G9FWrxMurc5gyRClqiSMEmA6cxFLUev7VNNtLNr4iA0fHSOPLGojpyBfaqddye2y55bIg'
    const tokenDifferentSignature = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Inl3YmtnZERzWFIwYmdfdl91YjZEcEFJeTlWSWkwbFdZTjJrNWw4TUlkb3cifQ.eyJzdWIiOiI5ZWYzNjgzMC1lZGFjLTExZTgtODMyYy0xZmQxZjE4ODU0YTgiLCJpc3MiOiJ0ZXN0LWlzc3VlciIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpYXQiOjE1NDI4MTUwMjksImF1dGhfdGltZSI6MTU0MjgxNTAyOSwiZXhwIjo3NTQyODE1MDI5LCJ0ZW5hbnRJZCI6IlRFU1QtVEVOQU5UIn0.LFS3fgm77CGQ6JUYPrGQXtREVrS2RVnc9lvUKcaon4SlN6Nm4SCPljEA5JieSBo1KeXyMAM0YolyX-4X-to0yGGR8Yo6HxpgyJTKaRc1NQ0f79PHteAN2YhJebwbhZuJl1Yr3CS94r4Yj77UAhzW7HYXKyasDvJanvxzSxEiX7s7p5KPKSOXtseg6StBrullExJtA_DuXn0mSrFwmQrRzNibxaVrNqqwU6C42juaz4cbmNrTBiVyxbxu1F6NIIK5F3BdoRYJi7tEcEGeCqZA4uWtPM4XnbhOLvWhYfSnU6wuCDzeoORe0REliaYVinGPPElThn7ZtlH7_cP44D7Qxg'

    const testIssuer = 'test-issuer'
    const testAudience = 'test-audience'

    process.env.ISSUER = testIssuer
    process.env.AUDIENCE = testAudience

    const tokenValidator = require(__dirname + '/../src/token-validator.ts')

    const publicKey = JSON.parse(fs.readFileSync(__dirname + '/resources/public.key', 'utf8'))

    it('Should be valid for a valid token', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenFutured, publicKey)
            expect(valid).toBe(true)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for a malformed token', async function (done) {
        try {
            const valid = await tokenValidator.validate('JUNK', publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for a wrong signature', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenFutured + 'JUNK', publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for an invalid signature', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenDifferentSignature, publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for an expired token', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenExpired, publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for a wrong issuer token', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenWrongIssuer, publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for a wrong audience token', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenWrongAudience, publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })

    it('Should be invalid for a missing subject token', async function (done) {
        try {
            const valid = await tokenValidator.validate(tokenNoSubject, publicKey)
            expect(valid).toBe(false)

            done()
        } catch (e) {
            done.fail(e)
        }
    })
})
