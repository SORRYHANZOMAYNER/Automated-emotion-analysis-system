package com.database.services;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.InputStream;

@Service
public class MinioService {
    private static final Logger logger = LoggerFactory.getLogger(MinioService.class);
    private final MinioClient minioClient;
    private final String bucketName;

    public MinioService(@Value("${minio.url}") String url,
                        @Value("${minio.bucket.name}") String bucketName) {
        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials("4jgCWeVle5Qtzlk8H73c", "5tOFQhgpgQFgC0Ld1a3DwHTTyAEETlnC5YBi922C")
                .build();
        this.bucketName = bucketName;
    }
    @Transactional
    public String uploadFile(InputStream fileStream, String fileName, String bucketname) throws Exception {
        try {
            logger.info("Starting file upload to MinIO: {}", fileName);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketname)
                            .object(fileName)
                            .stream(fileStream, -1, PutObjectArgs.MIN_MULTIPART_SIZE)
                            .contentType("image/png")
                            .build()
            );
            logger.info("File uploaded successfully: {}", fileName);
            return "http://62.109.19.68:9000/" + bucketname + "/" + fileName; 
        } catch (Exception e) {
            logger.error("Error uploading file to MinIO: {}", fileName, e);
            throw e;
        }
    }
}
