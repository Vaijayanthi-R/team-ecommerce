package com.team_ecommerce.backend.dto;

import java.util.List;

public class OrderRequestDTO {
    private List<OrderItemDTO> items;

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public static class OrderItemDTO {
        public Long productId;
        public int quantity;
        public double price;
    }
}
