package com.team_ecommerce.backend.entity;

import com.team_ecommerce.backend.enums.ProductStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;
    private String category;
    private double price;
    private int availableQuantity;

    private String sellerId;
    private String sellerName;

    @Builder.Default
    private List<String> imageFileIds = new ArrayList<>();

    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;

    private String adminRemarks;
    private String approvedByAdminId;

    // Pending update snapshot
    private PendingUpdate pendingUpdate;

    @Builder.Default
    private boolean hasPendingUpdate = false;

    // Analytics
    @Builder.Default
    private long totalUnitsSold = 0;

    @Builder.Default
    private boolean bestSeller = false;

    private int bestSellerRank;

    // Rating
    @Builder.Default
    private double averageRating = 0.0;

    @Builder.Default
    private int totalReviews = 0;

    // Discount
    private Double discountPercent;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public double getEffectivePrice() {
        if (discountPercent != null && discountPercent > 0) {
            return price - (price * discountPercent / 100);
        }
        return price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PendingUpdate {
        private String name;
        private String description;
        private String category;
        private Double price;
        private Integer availableQuantity;
        private Double discountPercent;
        private List<String> imageFileIds;
        private LocalDateTime submittedAt;
        private String sellerNote;
    }
}