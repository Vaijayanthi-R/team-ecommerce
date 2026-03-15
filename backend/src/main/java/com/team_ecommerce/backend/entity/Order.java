package com.team_ecommerce.backend.entity;

import com.team_ecommerce.backend.enums.OrderStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String userId;
    private String userEmail;

    private List<OrderItem> items;           // must have at least one

    private double totalAmount;              // auto-calculated

    @Builder.Default
    private OrderStatus status = OrderStatus.CREATED;

    private String shippingAddress;
    private String paymentId;                // Stripe payment intent ID

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    // ─── nested ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItem {
        private String productId;
        private String productName;
        private String sellerId;
        private double priceAtPurchase;      // snapshot — immutable after creation
        private double discountPercent;
        private int quantity;
        private double subtotal;             // priceAtPurchase * quantity
    }
}
