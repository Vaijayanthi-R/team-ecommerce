package com.team_ecommerce.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;


import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    @Id private String id;
    private String orderId;
    private String userId;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
    private double amount;
    private String currency;
    private String status;              // PENDING, SUCCEEDED, FAILED
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}