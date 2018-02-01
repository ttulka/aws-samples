package cz.net21.ttulka.cloud.server.aws.lambda;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.model.S3Object;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class UploadEventLogger implements RequestHandler<S3Event, String> {

    static AmazonS3 s3Client;

    @Override
    public String handleRequest(S3Event s3event, Context context) {
        S3EventNotification.S3Entity s3entity = s3event.getRecords().get(0).getS3();

        log.info(String.format("Processing an S3 entity: %s/%s", s3entity.getBucket().getName(), s3entity.getObject().getKey()));

        long objectSize = getS3ObjectSize(s3entity);

        log.info(String.format("Object size: %d", objectSize));

        return String.format("%s/%s:%d", s3entity.getBucket().getName(), s3entity.getObject().getKey(), objectSize);
    }

    private long getS3ObjectSize(S3EventNotification.S3Entity s3entity) {
        String bucket = s3entity.getBucket().getName();
        String key = s3entity.getObject().getKey();

        log.info("Retrieving an object from S3.");

        S3Object s3object = getS3Client().getObject(bucket, key);

        return s3object.getObjectMetadata().getContentLength();
    }

    private AmazonS3 getS3Client() {
        if (s3Client == null) {
            synchronized (UploadEventLogger.class) {
                if (s3Client == null) {
                    AWSCredentialsProvider credentialsProvider = new DefaultAWSCredentialsProviderChain();

                    log.info(String.format("Connecting to S3 with the Access Key Id %s.",
                                           credentialsProvider.getCredentials().getAWSAccessKeyId()));

                    s3Client = AmazonS3ClientBuilder.standard()
                            .withCredentials(credentialsProvider)
                            .build();
                }
            }
        }
        return s3Client;
    }
}
