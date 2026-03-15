package com.team_ecommerce.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(name = "user_product_idx", def = "{'userId': 1, 'productId': 1}", unique = true)
public class Review {

    @Id
    private String id;

    private String productId;
    private String userId;
    private String userName;        // denormalized for display
    private String orderId;         // must be a DELIVERED order

    private int rating;             // 1 to 5
    private String comment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}