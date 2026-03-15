package com.team_ecommerce.backend.dto.response;

import com.team_ecommerce.backend.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Builder
public class AuthResponse {
    private String token;
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}
