package cz.net21.ttulka.aws.lambda.auth;

import java.util.Map;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.cognitoidentity.AmazonCognitoIdentity;
import com.amazonaws.services.cognitoidentity.AmazonCognitoIdentityClientBuilder;
import com.amazonaws.services.cognitoidentity.model.Credentials;
import com.amazonaws.services.cognitoidentity.model.GetCredentialsForIdentityRequest;
import com.amazonaws.services.cognitoidentity.model.GetCredentialsForIdentityResult;
import com.amazonaws.services.cognitoidentity.model.GetIdRequest;
import com.amazonaws.services.cognitoidentity.model.GetIdResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import cz.net21.ttulka.aws.lambda.auth.helper.AuthenticationHelper;
import cz.net21.ttulka.aws.lambda.auth.helper.CognitoJWTParser;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class UserValidator implements RequestHandler<Map<String, Object>, String> {

    @Override
    public String handleRequest(Map<String, Object> map, Context context) {

        String username = (String) map.get("username");
        String password = (String) map.get("password");

        log.info("validating user: " + username);

        AuthProperties authProperties = new AuthProperties();
        AuthenticationHelper helper = new AuthenticationHelper(
                authProperties.getPoolId(), authProperties.getClientAppId(), authProperties.getRegion());
        String jwtToken = helper.PerformSRPAuthentication(username, password);

        if (jwtToken != null) {
            String provider = CognitoJWTParser.getPayload(jwtToken).get("iss").toString().replace("https://", "");
            log.info("jwtToken: " + jwtToken);
            log.info("provider: " + provider);

            Credentials awsCredentials = getCredentials(provider, jwtToken);
            return awsCredentials.toString();

        } else {
            log.info("Username/password is invalid.");
            throw new RuntimeException(
                    "{" +
                    "\"message\":\"Authentication failed\"," +
                    "\"type\":\"error\"" +
                    "}");
        }
    }

    /**
     * Returns the AWS credentials
     *
     * @param idprovider the IDP provider for the login map
     * @param id         the username for the login map.
     * @return returns the credentials based on the access token returned from the user pool.
     */
    private Credentials getCredentials(String idprovider, String id) {
        AuthProperties authProperties = new AuthProperties();
        AmazonCognitoIdentity provider = AmazonCognitoIdentityClientBuilder
                .standard()
                .withRegion(Regions.fromName(authProperties.getRegion()))
                .build();

        GetIdRequest idrequest = new GetIdRequest();
        idrequest.setIdentityPoolId(authProperties.getFederatedPoolId());
        idrequest.addLoginsEntry(idprovider, id);
        GetIdResult idResult = provider.getId(idrequest);

        GetCredentialsForIdentityRequest request = new GetCredentialsForIdentityRequest();
        request.setIdentityId(idResult.getIdentityId());
        request.addLoginsEntry(idprovider, id);

        GetCredentialsForIdentityResult result = provider.getCredentialsForIdentity(request);
        return result.getCredentials();
    }

}
