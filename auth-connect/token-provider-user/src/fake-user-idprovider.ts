import {UserIdentityProvider, UserInfo} from "./user-identity-provider"

export class FakeUserIdProvider implements UserIdentityProvider {

    async authenticate(userId: string, password: string): Promise<UserInfo> {
        if (password === '$Extrem_Geheim1') {
            return {
                userId,
                tenantId: userId.charAt(0).toUpperCase()
            }
        }
        throw new Error('Authorization failed.')
    }
}