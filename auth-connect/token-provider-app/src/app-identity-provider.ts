export type UserInfo = {
    appId: string,
    tenantId: string,
    [name: string]: string
}

export interface AppIdentityProvider {

    authenticate: (appId: string, password: string, authEntityId: string) => Promise<UserInfo>
}