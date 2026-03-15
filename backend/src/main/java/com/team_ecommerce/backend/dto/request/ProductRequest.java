package com.team_ecommerce.backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    @NotBlank
    private String category;
    @Positive
    private double price;
    @Min(0)
    private int availableQuantity;
    private Double discountPercent;
}