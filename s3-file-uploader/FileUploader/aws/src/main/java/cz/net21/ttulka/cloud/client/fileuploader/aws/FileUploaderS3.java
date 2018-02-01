package cz.net21.ttulka.cloud.client.fileuploader.aws;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import cz.net21.ttulka.cloud.client.fileuploader.FileUploader;
import cz.net21.ttulka.cloud.client.aws.AwsConfiguration;
import lombok.extern.apachecommons.CommonsLog;

@CommonsLog
public class FileUploaderS3 implements FileUploader {

    private final AmazonS3 client;

    private final String bucketName;

    public FileUploaderS3(AwsConfiguration awsConfiguration, String bucketName) {
        this.client = AmazonS3ClientBuilder.standard()
                .withClientConfiguration(awsConfiguration.getClientConfiguration())
                .withCredentials(new DefaultAWSCredentialsProviderChain())
                .withRegion(Regions.fromName(awsConfiguration.getRegionName()))
                .build();

        this.bucketName = bucketName;
    }

    @Override
    public void upload(Path... files) {
        if (!client.doesBucketExistV2(bucketName)) {
            throw new IllegalStateException("Bucket name is not available.");
        }
        log.info(String.format("Bucket %s is available.", bucketName));

        Arrays.stream(files).forEach(this::uploadFile);
    }

    private void uploadFile(Path file) {
        if (!Files.exists(file)) {
            throw new IllegalArgumentException("File not found: " + file);
        }
        if (!Files.isReadable(file) || !Files.isRegularFile(file)) {
            throw new IllegalArgumentException("File not readable: " + file);
        }

        client.putObject(bucketName, file.getFileName().toString(), file.toFile());

        log.info(String.format("%s successfully uploaded.", file));
    }
}
