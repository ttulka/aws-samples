package cz.net21.ttulka.cloud.client.fileuploader;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import cz.net21.ttulka.cloud.client.aws.AwsConfiguration;
import cz.net21.ttulka.cloud.client.fileuploader.aws.FileUploaderS3;

@Configuration
@ConfigurationProperties
@Profile({"default", "aws"})
public class FileUploaderAwsConfiguration {

    @Bean
    public AwsConfiguration awsConfiguration(
            @Value("${AWS_REGION_NAME:}") String regionName,
            @Value("${HTTPS_PROXY:}") String proxy
    ) {
        AwsConfiguration configuration = new AwsConfiguration(regionName);
        configuration.setProxy(proxy);

        return configuration;
    }

    @Bean
    public FileUploader fileUploader(
            AwsConfiguration awsConfiguration,
            @Value("${AWS_BUCKET_NAME:}") String bucketName
    ) {
        return new FileUploaderS3(awsConfiguration, bucketName);
    }
}
