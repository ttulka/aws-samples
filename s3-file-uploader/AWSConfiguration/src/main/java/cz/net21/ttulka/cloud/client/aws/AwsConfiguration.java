package cz.net21.ttulka.cloud.client.aws;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.amazonaws.ClientConfiguration;

public class AwsConfiguration {

    private final ClientConfiguration clientConfiguration;

    private final String regionName;

    public AwsConfiguration(String regionName) {
        this.regionName = regionName;
        this.clientConfiguration = new ClientConfiguration();
    }

    public ClientConfiguration getClientConfiguration() {
        return clientConfiguration;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setProxy(String proxy) {
        if (proxy != null && !proxy.isEmpty()) {
            setProxy(proxy, clientConfiguration);
        }
    }

    static void setProxy(String proxy, ClientConfiguration configuration) {
        Matcher matcher = Pattern.compile("(\\w{3,5})://(\\w+):(\\w+)@(.+):(\\d{1,5})").matcher(proxy);

        if (!matcher.matches()) {
            throw new IllegalArgumentException("Proxy not valid: " + proxy);
        }

        configuration.setProxyHost(matcher.group(4));
        configuration.setProxyPort(Integer.parseInt(matcher.group(5)));
        configuration.setProxyUsername(matcher.group(2));
        configuration.setProxyPassword(matcher.group(3));
    }
}
