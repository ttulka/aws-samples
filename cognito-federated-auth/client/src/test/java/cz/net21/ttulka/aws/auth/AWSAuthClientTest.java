package cz.net21.ttulka.aws.auth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Hex;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class AWSAuthClientTest {

    final String host = "xxxxxx.execute-api.eu-central-1.amazonaws.com";
    final String uri = "/prod";
    final String method = "GET";
    final String region = "eu-central-1";
    final String service = "execute-api";

    final String accessKeyId = "ASSSGFGHTSGF4HTGDGNQ";
    final String secretAccessKey = "15/ylGW9DC8jaISF+wXSsMSWoq+iPSdKSN0SeTp9";
    final String sessionToken = "FgFGSFSpZ2luEJr//////////wEaGGG1DWElRnEyRWwGMGKHAg8ijonfAzJiaXJxOzveTqbSD1fShDsPiFWEEer2W6Ep4uxLvhOZZJ1kJlfHu6N2CT1CJy2ujYGuG9LmSDTNmVOFCcmoQ3Pp2jVvYXqh8LdBX96kRY6sgrD5Gng6RkKp2/Msg693XYheQlIDGuxQkshQoeR+CWyv1koiMDKaOYuPiIFXfwOuX1g67eooPnIfHjAmXbHCHPVOS7p0MsRDkLNenFOOG57ptbLQl5BLY8OfFbRwgWghm3DaMqh/2mgzGyZB7RjH8dxZrzyGp4+RKlfRimtFeKaw94dKkXyXbJJPmiDNTryUIx2bkLDaychny5bYrWM6k6V7ywLYBKniaxoqwQUIkP//////////ARAAGgwwNTcxNzQxNTM5ODEiDEoiR/F0JsxlR7MwPSqVBWNRO7otOoGbcPHk0gyHV9nLl8JiiJGPKVEgfxVVUrILzagDUflX+VnzFPPIB3tjod38EYLDzasNS1//8mu2hklny3YunPbCC4O6ogqJ8USmW9W7saLj50MTTvP3nFDbi3UOUwsxNBcOuovWm8HUzeJ8CLCUvOMWL8Y2lXvuvo6Eb+Os2on/Y79EH/9qLH784fZY9lGcaXSjMjYUW5w77v5VyHthwf+f/0d/PV1JmjtMkc4CGKZloXAWNUj7ZpnfUOrB/guaTVrWRDgvD+/NYTrba+HQwOG9O0WS/1JiYFPGZtNXD0uID/LizjWM1z68L3UNJRw5dUlRWaebkNH0S6JdWD2Sg3fJYkdO7dMiGxDFITwBlG+Csw9C1Y7OeHaKQMpUebWinLhgvFCnBYcCgfi7nSsThFs2g/D6S6I0RMQiuTh0b+OddBM6j15OmcjPyaRcdySwBt7L+Y0TyXMAah7qgh5JfEopuJ45H+TWpG/qvUXy4lzmtjbLwtO24FJq5RD6DzTeMx26l3pm9SJoNWod2YopGBG4FZ73PgOp/JzkZVS5xYECkUmeonwKcH5WqPzBRvpdibeLOuOm3quj5rdMw0PelK7gZvr6dvhW5fWRo+zWGR+SIHiCobT7ft2usa/rOndPtWnWQLBXpemHoyiWdX0Qxr5L0Bq51W60KDdGougTsDT62SmozcLvTTgunx0MWOznZjhOa/LnwtmBhAE5+f96Ge0Wr9HJq9rOmeTusZe1jBBpWftQbHqpmbENWW33/onLc/2yQwICVvJFWVqb6fSDssij4/OSDvT/jh8J77B/LhnVU/DO0mEE3h7vJ1KDZbFi+vPNHwKSDHHaFYyI5rPEWRt/tJjERi6gLgCdRREkuSRGMUwkWT/1AU=";
    final String dateTime = "20180307T154121Z";

    @Test
    public void authTest() {

        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {

            HttpGet httpget = new HttpGet("https://" + host + uri);

            getHeaders(accessKeyId, secretAccessKey, sessionToken, dateTime)
                    .forEach(httpget::setHeader);

            System.out.println("Executing request " + httpget.getRequestLine());

            try (CloseableHttpResponse response = httpclient.execute(httpget)) {
                assertEquals(200, response.getStatusLine().getStatusCode());
                assertEquals("\"Hello World!\"", EntityUtils.toString(response.getEntity()));
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    Map<String, String> getHeaders(
            String accessKeyId, String secretAccessKey, String sessionToken, String dateTime) {
        Map<String, String> headers = new HashMap<>();
        //headers.add(new Header("Content-Type", "application/x-www-form-urlencoded"));
        headers.put("Host", host);
        headers.put("X-Amz-Date", dateTime);
        headers.put("X-Amz-Security-Token", sessionToken);

        String credentialString = getCredentialString(dateTime, region, service);
        String signedHeaders = getSignedHeaders(headers);
        String signature = getSignature(dateTime, secretAccessKey, region, service, headers);

        String authHeader = getAuthHeader(accessKeyId, credentialString, signedHeaders, signature);
        headers.put("Authorization", authHeader);

        return headers;
    }

    private String getCredentialString(String dateTime, String region, String service) {
        return dateTime.substring(0, 8) + "/" + region + "/" + service + "/" + "aws4_request";
    }

    private String getSignedHeaders(Map<String, String> headers) {
        return headers.keySet().stream()
                .map(String::toLowerCase)
                .sorted()
                .collect(Collectors.joining(";"));
    }

    private String getSignature(String dateTime, String secretAccessKey, String region, String service, Map<String, String> headers) {
        String date = dateTime.substring(0, 8);

        byte[] kDate = hmac(("AWS4" + secretAccessKey).getBytes(), date);
        byte[] kRegion = hmac(kDate, region);
        byte[] kService = hmac(kRegion, service);
        byte[] signingKey = hmac(kService, "aws4_request");

        return hex(hmac(signingKey, getStringToSign(dateTime, region, service, headers)));
    }

    private String getStringToSign(String dateTime, String region, String service, Map<String, String> headers) {
        return "AWS4-HMAC-SHA256" + "\n"
               + dateTime + "\n"
               + getCredentialString(dateTime, region, service) + "\n"
               + hex(SHA256Hash(getCanonicalString(headers)));
    }

    private String getCanonicalString(Map<String, String> headers) {
        return method + "\n"
               + uri + "\n" + "\n"
               + getCanonicalHeaders(headers) + "\n" + "\n"
               + getSignedHeaders(headers) + "\n"
               + hex(SHA256Hash("")) /* body */;
    }

    private String getCanonicalHeaders(Map<String, String> headers) {
        return headers.entrySet().stream()
                .map(h -> h.getKey().toLowerCase() + ":" + h.getValue())
                .sorted()
                .collect(Collectors.joining("\n"));
    }

    private String getAuthHeader(String accessKeyId, String credentialString, String signedHeaders, String signature) {
        return "AWS4-HMAC-SHA256 Credential=" + accessKeyId + "/" + credentialString + ", "
               + "SignedHeaders=" + signedHeaders + ", "
               + "Signature=" + signature;
    }

    private static byte[] hmac(byte[] key, String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key, "HmacSHA256");
            sha256_HMAC.init(secret_key);

            return sha256_HMAC.doFinal(data.getBytes("UTF-8"));

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] SHA256Hash(String s) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(s.getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static String hex(byte[] data) {
        return new String(Hex.encodeHex(data));
    }
}
