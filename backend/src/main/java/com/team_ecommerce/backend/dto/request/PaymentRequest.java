package com.team_ecommerce.backend.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class PaymentRequest {
    @NotBlank private String orderId;
}