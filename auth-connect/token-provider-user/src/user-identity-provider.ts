export type UserInfo = {
    userId: string,
    tenantId: string,
    [name: string]: string
}

export interface UserIdentityProvider {

    authenticate: (userId: string, password: string) => Promise<UserInfo>
}