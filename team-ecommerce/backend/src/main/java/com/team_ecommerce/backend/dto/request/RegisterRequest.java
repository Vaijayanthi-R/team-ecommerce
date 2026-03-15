package com.team_ecommerce.backend.dto.request;
//register
import com.team_ecommerce.backend.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    private String phone;
    private Role role = Role.USER;   // USER or SELLER only at self-registration
}