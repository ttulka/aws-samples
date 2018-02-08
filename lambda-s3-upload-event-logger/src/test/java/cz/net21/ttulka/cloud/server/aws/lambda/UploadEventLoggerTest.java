package cz.net21.ttulka.cloud.server.aws.lambda;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Collections;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.event.S3EventNotification;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;

import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UploadEventLoggerTest {

    private static final String BUCKET_NAME = "test-bucket-name";
    private static final String OBJECT_KEY = "test-object-key";
    private static final long OBJECT_SIZE = 1234L;

    @Mock
    private AmazonS3 s3clientMock;

    @Mock
    private Context contextMock;

    private UploadEventLogger lambda = new UploadEventLogger();

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);

        S3Object s3Object = mock(S3Object.class);
        ObjectMetadata objectMetadata = mock(ObjectMetadata.class);

        when(s3Object.getObjectMetadata()).thenReturn(objectMetadata);
        when(objectMetadata.getContentLength()).thenReturn(OBJECT_SIZE);

        when(s3clientMock.getObject(BUCKET_NAME, OBJECT_KEY)).thenReturn(s3Object);

        UploadEventLogger.s3Client = s3clientMock;

        lambda = spy(lambda);
    }

    private S3Event generateS3Event() {
        try (InputStream is = UploadEventLoggerTest.class.getResourceAsStream("/test-s3event.json")) {
            String json = IOUtils.toString(is, Charset.defaultCharset());
            S3EventNotification event = S3EventNotification.parseJson(json);

            return new S3Event(event.getRecords());

        } catch (IOException rethrow) {
            throw new RuntimeException(rethrow);
        }
    }

    @Test
    public void handleRequestTest() {
        lambda.handleRequest(generateS3Event(), contextMock);

        verify(s3clientMock).getObject(eq(BUCKET_NAME), eq(OBJECT_KEY));
        verify(lambda).logObjectSize(OBJECT_SIZE);
    }
}
