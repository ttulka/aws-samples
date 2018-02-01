package cz.net21.ttulka.cloud.client.fileuploader;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FileUploaderApplication implements CommandLineRunner {

    @Autowired
    private FileUploader fileUploader;

    @Override
    public void run(String... args) throws Exception {

        if (args.length == 0) {
            throw new IllegalArgumentException("No files to upload.");
        }

        List<Path> filesToUpload = Arrays.stream(args)
                .distinct()
                .map(Paths::get)
                .collect(Collectors.toList());

        fileUploader.upload(filesToUpload.toArray(new Path[0]));
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(FileUploaderApplication.class, args);
    }
}
