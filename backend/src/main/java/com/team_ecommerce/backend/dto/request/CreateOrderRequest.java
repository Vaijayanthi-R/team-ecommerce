package com.team_ecommerce.backend.dto.request;

import lombok.*;


import jakarta.validation.constraints.*;

@Data
public class CreateOrderRequest {
    @NotEmpty
    private java.util.List<OrderItemRequest> items;
    @NotBlank
    private String shippingAddress;
}
