package com.team_ecommerce.backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class OrderItemRequest {
    @NotBlank private String productId;
    @Min(1)   private int quantity;
}