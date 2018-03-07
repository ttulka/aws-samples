package cz.net21.ttulka.aws.lambda.auth;

import lombok.Getter;

@Getter
public class AuthProperties {

    private final String poolId;
    private final String clientAppId;
    private final String federatedPoolId;
    private final String region;

    public AuthProperties() {
        poolId = System.getenv("POOL_ID");
        clientAppId = System.getenv("CLIENT_APP_ID");
        federatedPoolId = System.getenv("FEDERARED_POOL_ID");
        region = System.getenv("REGION");
    }
}
