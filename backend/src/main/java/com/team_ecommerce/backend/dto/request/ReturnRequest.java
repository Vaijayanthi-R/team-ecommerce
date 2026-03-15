package com.team_ecommerce.backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class ReturnRequest {
    @NotBlank private String orderId;
    @NotBlank private String productId;
    @NotBlank private String reason;
}