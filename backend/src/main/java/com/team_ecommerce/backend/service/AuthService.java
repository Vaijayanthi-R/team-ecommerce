package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.request.LoginRequest;
import com.team_ecommerce.backend.dto.request.RegisterRequest;
import com.team_ecommerce.backend.dto.response.AuthResponse;
import com.team_ecommerce.backend.enums.Role;
import com.team_ecommerce.backend.entity.Seller;
import com.team_ecommerce.backend.entity.User;
import com.team_ecommerce.backend.repository.SellerRepository;
import com.team_ecommerce.backend.repository.UserRepository;
import com.team_ecommerce.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final SellerRepository sellerRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLog;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        // Only USER or SELLER allowed at self-registration
        Role role = (req.getRole() == Role.SELLER) ? Role.SELLER : Role.USER;

        User user = User.builder()
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .phone(req.getPhone())
            .role(role)
            .build();

        user = userRepo.save(user);

        // Create empty seller profile if registering as seller
        if (role == Role.SELLER) {
            Seller seller = Seller.builder()
                .userId(user.getId())
                .businessEmail(req.getEmail())
                .build();
            sellerRepo.save(seller);
        }

        auditLog.log("USER_REGISTERED", user.getId(), user.getId(),
            role + " registered: " + user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), role);
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.isActive())
            throw new RuntimeException("Account is deactivated");

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .build();
    }
}
