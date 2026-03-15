package com.team_ecommerce.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

import com.team_ecommerce.backend.entity.Product;
import com.team_ecommerce.backend.enums.*;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Builder
public class ProductResponse {

    private String id;
    private String name;
    private String description;
    private String category;
    private double price;
    private double effectivePrice;
    private Double discountPercent;
    private int availableQuantity;
    private String sellerId;
    private String sellerName;
    private List<String> imageFileIds;
    private ProductStatus status;
    private boolean bestSeller;
    private int bestSellerRank;
    private long totalUnitsSold;
    private LocalDateTime createdAt;
 
    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
            .id(p.getId()).name(p.getName()).description(p.getDescription())
            .category(p.getCategory()).price(p.getPrice())
            .effectivePrice(p.getEffectivePrice())
            .discountPercent(p.getDiscountPercent())
            .availableQuantity(p.getAvailableQuantity())
            .sellerId(p.getSellerId()).sellerName(p.getSellerName())
            .imageFileIds(p.getImageFileIds()).status(p.getStatus())
            .bestSeller(p.isBestSeller()).bestSellerRank(p.getBestSellerRank())
            .totalUnitsSold(p.getTotalUnitsSold()).createdAt(p.getCreatedAt())
            .build();
    }
}
