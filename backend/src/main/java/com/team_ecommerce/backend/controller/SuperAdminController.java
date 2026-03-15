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
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
class SuperAdminController {
    private final com.team_ecommerce.backend.repository.UserRepository userRepo;
    private final AuthService authService;
    private final AuditLogService auditLogService;
    private final AnalyticsService analyticsService;
 
    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<?>> createAdmin(
            @Valid @RequestBody RegisterRequest req) {
        req.setRole(com.team_ecommerce.backend.enums.Role.ADMIN);
        return ResponseEntity.ok(ApiResponse.ok("Admin created", authService.register(req)));
    }
 
    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<?>> listAdmins() {
        var admins = userRepo.findAll().stream()
            .filter(u -> u.getRole() == com.team_ecommerce.backend.enums.Role.ADMIN)
            .toList();
        return ResponseEntity.ok(ApiResponse.ok("Admins fetched", admins));
    }
 
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<?>> auditLogs() {
        return ResponseEntity.ok(ApiResponse.ok("Audit logs", auditLogService.getAll()));
    }
 
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<?>> platformAnalytics() {
        return ResponseEntity.ok(ApiResponse.ok("Platform analytics",
            analyticsService.getPlatformOverview()));
    }
}