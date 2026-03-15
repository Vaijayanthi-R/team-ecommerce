package com.team_ecommerce.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
 
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "return_requests")
public class ReturnRequest {
    @Id private String id;
    private String orderId;
    private String userId;
    private String productId;
    private String reason;
    private String status;               // PENDING, APPROVED, REJECTED, REFUNDED
    private String adminRemarks;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}