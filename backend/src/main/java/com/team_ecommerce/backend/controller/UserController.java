package com.team_ecommerce.backend.controller;

import com.team_ecommerce.backend.dto.request.*;
import com.team_ecommerce.backend.dto.response.*;
import com.team_ecommerce.backend.enums.OrderStatus;
import com.team_ecommerce.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
class UserController {
    private final com.team_ecommerce.backend.repository.UserRepository userRepo;
    private final NotificationService notifService;
 
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMe(Authentication auth) {
        var user = userRepo.findById(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched", user));
    }
 
    @GetMapping("/wishlist")
    public ResponseEntity<ApiResponse<?>> getWishlist(Authentication auth) {
        var user = userRepo.findById(auth.getName()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.ok("Wishlist fetched", user.getWishlistProductIds()));
    }
 
    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            Authentication auth, @PathVariable String productId) {
        var user = userRepo.findById(auth.getName()).orElseThrow();
        if (!user.getWishlistProductIds().contains(productId)) {
            user.getWishlistProductIds().add(productId);
            userRepo.save(user);
        }
        return ResponseEntity.ok(ApiResponse.ok("Added to wishlist"));
    }
 
    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            Authentication auth, @PathVariable String productId) {
        var user = userRepo.findById(auth.getName()).orElseThrow();
        user.getWishlistProductIds().remove(productId);
        userRepo.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Removed from wishlist"));
    }
 
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Notifications",
            notifService.getForRecipient(auth.getName())));
    }
}