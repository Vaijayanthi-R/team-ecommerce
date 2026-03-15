package com.team_ecommerce.backend.service;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSDownloadStream;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class GridFsService {
 
    private final GridFSBucket gridFSBucket;
 
    public String store(MultipartFile file, String category) throws IOException {
        GridFSUploadOptions options = new GridFSUploadOptions()
            .chunkSizeBytes(1048576)
            .metadata(new Document("contentType", file.getContentType())
                .append("category", category)
                .append("originalName", file.getOriginalFilename()));
 
        try (InputStream is = file.getInputStream()) {
            ObjectId id = gridFSBucket.uploadFromStream(
                file.getOriginalFilename(), is, options);
            return id.toHexString();
        }
    }
 
    public byte[] retrieve(String fileId) throws IOException {
        try (GridFSDownloadStream stream = gridFSBucket
                .openDownloadStream(new ObjectId(fileId))) {
            return stream.readAllBytes();
        }
    }
 
    public String getContentType(String fileId) {
        var file = gridFSBucket.find(
            new Document("_id", new ObjectId(fileId))).first();
        if (file == null) return "application/octet-stream";
        var meta = file.getMetadata();
        return meta != null ? meta.getString("contentType") : "application/octet-stream";
    }
 
    public void delete(String fileId) {
        gridFSBucket.delete(new ObjectId(fileId));
    }
}