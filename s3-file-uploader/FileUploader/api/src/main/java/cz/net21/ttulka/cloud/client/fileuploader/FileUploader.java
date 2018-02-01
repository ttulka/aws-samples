package cz.net21.ttulka.cloud.client.fileuploader;

import java.nio.file.Path;

public interface FileUploader {

    void upload(Path... files);
}
