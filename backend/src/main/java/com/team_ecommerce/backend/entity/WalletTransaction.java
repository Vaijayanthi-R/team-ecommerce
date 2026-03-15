package com.team_ecommerce.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
 
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "wallet_transactions")
public class WalletTransaction {
    @Id private String id;
    private String sellerId;
    private String orderId;
    private double grossAmount;
    private double shippingDeduction;
    private double platformFeeDeduction;
    private double netCredited;
    private String description;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}