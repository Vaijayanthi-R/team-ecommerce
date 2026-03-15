package com.team_ecommerce.backend.dto.response;

import java.time.LocalDateTime;
import java.util.*;

import com.team_ecommerce.backend.entity.*;
import com.team_ecommerce.backend.enums.*;

import lombok.*;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Builder
public class SellerResponse {
    private String id;
    private String userId;
    private String businessName;
    private String businessEmail;
    private String phone;
    private String address;
    private String gstNumber;
    private SellerStatus status;
    private String adminRemarks;
    private List<Seller.CertificateFile> certificates;
    private LocalDateTime createdAt;
 
    public static SellerResponse from(Seller s) {
        return SellerResponse.builder()
            .id(s.getId()).userId(s.getUserId())
            .businessName(s.getBusinessName()).businessEmail(s.getBusinessEmail())
            .phone(s.getPhone()).address(s.getAddress()).gstNumber(s.getGstNumber())
            .status(s.getStatus()).adminRemarks(s.getAdminRemarks())
            .certificates(s.getCertificates()).createdAt(s.getCreatedAt())
            .build();
    }
}
