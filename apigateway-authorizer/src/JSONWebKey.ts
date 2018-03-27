const request = require('request');
const jose = require('node-jose');

const _keysCache: any[][] = new Array<Array<any>>();   // [userPoolId][kid]

export class JSONWebKey {

    getPublicKey(userPoolId: string, region:string, kid: string): Promise<any> {
        return new Promise((done: (publicKey) => void, reject) => {
            let key = this.getFromCache(userPoolId, kid);
            if (key) {
                done(_keysCache[userPoolId][kid]);

            } else {
                let url = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
                request(url, {json: true}, (err, res, body) => {
                    if (err) {
                        reject(JSON.stringify(err));
                    } else {
                        let key = body.keys.find(key => key.kid == kid);
                        let putIntoCache = this.putIntoCache;

                        jose.JWK.asKey(key).then(function (publicKey) {
                            putIntoCache(userPoolId, kid, publicKey);
                            done(publicKey);
                        });
                    }
                });
            }
        });
    }

    private getFromCache(userPoolId: string, kid: string): any {
        if (_keysCache[userPoolId] && _keysCache[userPoolId][kid]) {
            return _keysCache[userPoolId][kid];
        }
    }

    private putIntoCache(userPoolId: string, kid: string, pk: any): void {
        if (!_keysCache[userPoolId]) {
            _keysCache[userPoolId] = new Array<string>();
        }
        _keysCache[userPoolId][kid] = pk;
    }
}