package cz.net21.ttulka.cloud.client.aws;

import com.amazonaws.ClientConfiguration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class AwsConfigurationTest {

    private ClientConfiguration configuration;

    @BeforeEach
    public void setUp() {
        configuration = new ClientConfiguration();
    }

    @Test
    public void setProxyTest() {
        assertThat(configuration.getProxyHost(), is(nullValue()));
        assertThat(configuration.getProxyPort(), is(-1));
        assertThat(configuration.getProxyUsername(), is(nullValue()));
        assertThat(configuration.getProxyPassword(), is(nullValue()));

        AwsConfiguration.setProxy("http://testuser:testpass@testhost:8080", configuration);

        assertThat(configuration.getProxyHost(), is("testhost"));
        assertThat(configuration.getProxyPort(), is(8080));
        assertThat(configuration.getProxyUsername(), is("testuser"));
        assertThat(configuration.getProxyPassword(), is("testpass"));

        assertThrows(IllegalArgumentException.class, () -> AwsConfiguration.setProxy("xxx", configuration));
    }
}
