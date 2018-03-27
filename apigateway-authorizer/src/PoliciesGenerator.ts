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

    generatePolicies(tenantId: string, role: string): AuthResponse {
        let authResponse = new AuthResponse(this.sub, this.appId);
        authResponse.policyDocument.Statement = this.getStatements(tenantId, role);
        authResponse.context = {
            "tenantId": tenantId
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
        return new Array(
            this.allowMethod("GET", `/tenant-info/${tenantId}`);
            // TODO ...
        );
    }

    private getPoliciesForServiceRole(tenantId: string): Statement[] {
        return new Array(
            this.allowMethod("GET", `/tenant/${tenantId}`)
            // TODO ...
        );
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

class AuthResponse {
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