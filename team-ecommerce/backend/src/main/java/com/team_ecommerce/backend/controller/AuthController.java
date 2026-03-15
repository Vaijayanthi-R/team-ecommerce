package com.team_ecommerce.backend.controller;
//auth controller
import com.team_ecommerce.backend.dto.request.*;
import com.team_ecommerce.backend.dto.response.*;
import com.team_ecommerce.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {
    private final AuthService authService;
 
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req) {
        return ResponseEntity
        .ok(ApiResponse
            .ok("Registered successfully",authService.register(req)));
    }
 
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful",authService.login(req)));
    }
}

