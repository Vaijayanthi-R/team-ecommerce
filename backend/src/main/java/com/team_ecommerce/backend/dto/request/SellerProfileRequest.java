package com.team_ecommerce.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class SellerProfileRequest {
    @NotBlank private String businessName;
    @NotBlank private String businessEmail;
    private String phone;
    private String address;
    private String gstNumber;
}
