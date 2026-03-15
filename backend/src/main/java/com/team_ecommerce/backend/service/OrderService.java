package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.request.CreateOrderRequest;
import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.enums.OrderStatus;
import com.team_ecommerce.backend.enums.ProductStatus;
import com.team_ecommerce.backend.entity.Order;
import com.team_ecommerce.backend.entity.Product;
import com.team_ecommerce.backend.repository.OrderRepository;
import com.team_ecommerce.backend.repository.ProductRepository;
import com.team_ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final ProductService productService;
    private final NotificationService notifService;
    private final AuditLogService auditLog;

    public Order createOrder(String userId, CreateOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new RuntimeException("Order must contain at least one product");

        var user = userRepo.findById(userId).orElseThrow();
        List<Order.OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (var itemReq : req.getItems()) {
            Product product = productRepo.findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException(
                    "Product not found: " + itemReq.getProductId()));

            // Business rules
            if (product.getStatus() != ProductStatus.ACTIVE)
                throw new RuntimeException(
                    "Product '" + product.getName() + "' is not available for ordering");

            if (itemReq.getQuantity() > product.getAvailableQuantity())
                throw new RuntimeException(
                    "Requested quantity exceeds available stock for: " + product.getName()
                    + " (available: " + product.getAvailableQuantity() + ")");

            double priceAtPurchase = product.getEffectivePrice();
            double subtotal = priceAtPurchase * itemReq.getQuantity();

            orderItems.add(Order.OrderItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sellerId(product.getSellerId())
                .priceAtPurchase(priceAtPurchase)
                .discountPercent(product.getDiscountPercent() != null
                    ? product.getDiscountPercent() : 0)
                .quantity(itemReq.getQuantity())
                .subtotal(subtotal)
                .build());

            total += subtotal;
        }

        Order order = Order.builder()
            .userId(userId)
            .userEmail(user.getEmail())
            .items(orderItems)
            .totalAmount(total)
            .shippingAddress(req.getShippingAddress())
            .status(OrderStatus.CREATED)
            .build();

        order = orderRepo.save(order);

        notifService.create(userId,
            "Order #" + order.getId() + " placed successfully! Total: $" + total,
            NotifType.ORDER_UPDATE);

        auditLog.log("ORDER_CREATED", order.getId(), userId,
            "Order created with " + orderItems.size() + " item(s), total: $" + total);

        return order;
    }

    public Order updateStatus(String orderId, OrderStatus newStatus, String performedBy) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus current = order.getStatus();

        if (!current.canTransitionTo(newStatus))
            throw new RuntimeException(
                "Invalid status transition: " + current + " → " + newStatus);

        // Reduce stock when CONFIRMED
        if (newStatus == OrderStatus.CONFIRMED) {
            for (Order.OrderItem item : order.getItems()) {
                productService.decrementStock(item.getProductId(), item.getQuantity());
            }
            notifService.create(order.getUserId(),
                "Your order #" + orderId + " has been confirmed!",
                NotifType.ORDER_UPDATE);

            // Notify each seller
            order.getItems().forEach(item ->
                notifService.create(item.getSellerId(),
                    "New confirmed order for \"" + item.getProductName()
                    + "\" x" + item.getQuantity(),
                    NotifType.ORDER_UPDATE));
        }

        if (newStatus == OrderStatus.SHIPPED) {
            notifService.create(order.getUserId(),
                "Your order #" + orderId + " has been shipped! 🚚",
                NotifType.ORDER_UPDATE);
        }

        if (newStatus == OrderStatus.DELIVERED) {
            notifService.create(order.getUserId(),
                "Your order #" + orderId + " has been delivered! 📦",
                NotifType.ORDER_UPDATE);
        }

        if (newStatus == OrderStatus.CANCELLED) {
            // Stock already not reduced (only reduces at CONFIRMED)
            notifService.create(order.getUserId(),
                "Your order #" + orderId + " has been cancelled.",
                NotifType.ORDER_UPDATE);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepo.save(order);

        auditLog.log("ORDER_STATUS_CHANGED", orderId, performedBy,
            current + " → " + newStatus);

        return order;
    }

    public Order cancelOrder(String orderId, String userId) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId))
            throw new RuntimeException("Not your order");

        return updateStatus(orderId, OrderStatus.CANCELLED, userId);
    }

    public List<Order> getMyOrders(String userId) {
        return orderRepo.findByUserId(userId);
    }

    public Order getById(String orderId) {
        return orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public List<Order> getSellerOrders(String userId) {
        // get sellerId from userId via seller repo handled in controller
        return orderRepo.findAll();
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
}