package com.team_ecommerce.backend.entity;

import com.team_ecommerce.backend.enums.SellerStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sellers")
public class Seller {

    @Id
    private String id;

    private String userId;          // links to User
    private String businessName;
    private String businessEmail;
    private String phone;
    private String address;
    private String gstNumber;

    // GridFS file IDs for uploaded certificates
    @Builder.Default
    private List<CertificateFile> certificates = new ArrayList<>();

    @Builder.Default
    private SellerStatus status = SellerStatus.PENDING;

    private String adminRemarks;     // reason for rejection if any
    private String approvedByAdminId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateFile {
        private String fileId;          // GridFS ObjectId
        private String fileName;
        private String certType;        // FSSAI, ISI, BUSINESS_LICENSE, etc.
        private LocalDateTime uploadedAt;
    }
}