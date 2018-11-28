import {AppIdentityProvider, UserInfo} from "./app-identity-provider"

export class FakeAppIdProviderByUser implements AppIdentityProvider {

    async authenticate(appId: string, password: string, userId: string): Promise<UserInfo> {
        if (password === '$Extrem_Geheim1') {
            return {
                appId,
                tenantId: userId.charAt(0).toUpperCase()
            }
        }
        throw new Error('Authorization failed.')
    }
}