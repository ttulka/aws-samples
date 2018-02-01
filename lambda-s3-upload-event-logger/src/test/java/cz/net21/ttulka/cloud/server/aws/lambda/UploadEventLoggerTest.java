package cz.net21.ttulka.cloud.server.aws.lambda;

import java.util.Collections;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UploadEventLoggerTest {

    private static final String BUCKET_NAME = "test-bucket-name";
    private static final String OBJECT_KEY = "test-object-key";

    @Mock
    private AmazonS3 s3clientMock;

    @Mock
    private S3Event s3eventMock;
    @Mock
    private Context contextMock;

    private UploadEventLogger lambda = new UploadEventLogger();

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);

        S3EventNotification.S3EventNotificationRecord s3EventNotificationRecord = mock(S3EventNotification.S3EventNotificationRecord.class);
        S3EventNotification.S3Entity s3Entity = mock(S3EventNotification.S3Entity.class);
        S3EventNotification.S3BucketEntity s3BucketEntity = mock(S3EventNotification.S3BucketEntity.class);
        S3EventNotification.S3ObjectEntity s3ObjectEntity = mock(S3EventNotification.S3ObjectEntity.class);

        when(s3BucketEntity.getName()).thenReturn(BUCKET_NAME);
        when(s3ObjectEntity.getKey()).thenReturn(OBJECT_KEY);

        when(s3Entity.getBucket()).thenReturn(s3BucketEntity);
        when(s3Entity.getObject()).thenReturn(s3ObjectEntity);
        when(s3EventNotificationRecord.getS3()).thenReturn(s3Entity);

        when(s3eventMock.getRecords()).thenReturn(Collections.singletonList(s3EventNotificationRecord));

        S3Object s3Object = mock(S3Object.class);
        ObjectMetadata objectMetadata = mock(ObjectMetadata.class);

        when(s3Object.getObjectMetadata()).thenReturn(objectMetadata);

        when(s3clientMock.getObject(BUCKET_NAME, OBJECT_KEY)).thenReturn(s3Object);

        UploadEventLogger.s3Client = s3clientMock;
    }

    @Test
    public void handleRequestTest() {
        lambda.handleRequest(s3eventMock, contextMock);

        verify(s3clientMock).getObject(eq(BUCKET_NAME), eq(OBJECT_KEY));
    }
}
