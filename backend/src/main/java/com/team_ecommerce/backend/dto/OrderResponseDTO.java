package com.team_ecommerce.backend.dto;

import java.time.LocalDateTime;

public class OrderResponseDTO {
    private Long id;
    private double totalAmount;
    private LocalDateTime orderDate;

    public OrderResponseDTO() {
    }

    public OrderResponseDTO(Long id, double totalAmount, LocalDateTime orderDate) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.orderDate = orderDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
}
