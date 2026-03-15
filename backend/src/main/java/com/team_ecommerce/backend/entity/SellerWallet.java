package com.team_ecommerce.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "seller_wallets")
public class SellerWallet {
    @Id private String id;
    private String sellerId;
    @Builder.Default private double balance = 0.0;
    @Builder.Default private double totalEarned = 0.0;
    @Builder.Default private LocalDateTime updatedAt = LocalDateTime.now();
}