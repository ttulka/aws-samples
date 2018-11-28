import {AppIdentityProvider, UserInfo} from "./app-identity-provider"

export class FakeAppIdProviderByTenant implements AppIdentityProvider {

    async authenticate(appId: string, password: string, tenantId: string): Promise<UserInfo> {
        if (password === '$Extrem_Geheim1') {
            return {
                appId,
                tenantId
            }
        }
        throw new Error('Authorization failed.')
    }
}