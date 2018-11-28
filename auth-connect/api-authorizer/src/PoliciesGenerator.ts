export class PoliciesGenerator {

    private sub: string;

    private region: string;
    private accountId: string;
    private appId: string;
    private stage: string;

    constructor(sub: string, methodArn: string) {
        this.sub = sub;

        let result = /arn:aws:execute-api:([\w-]+):(\d+):(\w+)\/(\w+)\/.+/.exec(methodArn);
        if (result) {
            this.region = result[1];
            this.accountId = result[2];
            this.appId = result[3];
            this.stage = result[4];
        }
    }

    generateAuthResponse(tenantId: string, role: string, token: string): AuthResponse {
        let authResponse = new AuthResponse(this.sub, this.appId);
        authResponse.policyDocument.Statement = this.getStatements(tenantId, role);
        authResponse.context = {
            token,
            tenantId,
            isolationRoleArn: `arn:aws:iam::${this.accountId}:role/${tenantId}-tenant-isolation-role-${this.region}-${this.stage}`
        };
        return authResponse;
    }

    private getStatements(tenantId: string, role: string): Statement[] {
        switch (role) {
            case "admin":
                return this.getPoliciesForAdminRole(tenantId);
            case "service":
                return this.getPoliciesForServiceRole(tenantId);
            default:
                return new Array<Statement>(this.deny("*", "*")); // deny all
        }
    }

    private getPoliciesForAdminRole(tenantId: string): Statement[] {
        return [
            this.allowMethod("GET", '/admin/*'),
            this.allowMethod("POST", '/admin/*')
            this.allowMethod("PUT", '/admin/*'),
            this.allowMethod("DELETE", '/admin/*'),
            ...this.getPoliciesForServiceRole(tenantId),
        ];
    }

    private getPoliciesForServiceRole(tenantId: string): Statement[] {
        return [
            this.allowMethod("GET", '/service/*'),
            this.allowMethod("POST", '/service/*'),
			this.allowMethod("PUT", '/service/*'),
			this.allowMethod("DELETE", '/service/*'),
        ];
    }

    private allowMethod(method: "GET" | "POST" | "PUT" | "DELETE", resource: string) {
        return this.allow("execute-api:Invoke",
            `arn:aws:execute-api:${this.region}:${this.accountId}:${this.appId}/${this.stage}/${method}${resource}`);
    }

    private allow(action: string, resource: string): Statement {
        return new Statement(action, "Allow", resource);
    }

    private deny(action: string, resource: string): Statement {
        return new Statement(action, "Deny", resource);
    }
}

export class AuthResponse {
    principalId: string;
    usageIdentifierKey: string;
    policyDocument: PolicyDocument;
    context: object;

    constructor(principalId, usageIdentifierKey) {
        this.principalId = principalId;
        this.usageIdentifierKey = usageIdentifierKey;
        this.policyDocument = new PolicyDocument();
    }
}

class PolicyDocument {
    Version = "2012-10-17";
    Statement: Statement[];
}

class Statement {
    Action: string;
    Effect: "Allow" | "Deny";
    Resource: string;

    constructor(Action, Effect, Resource) {
        this.Action = Action;
        this.Effect = Effect;
        this.Resource = Resource;
    }
}