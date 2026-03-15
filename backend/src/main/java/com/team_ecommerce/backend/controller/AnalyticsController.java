package com.team_ecommerce.backend.controller;

import com.team_ecommerce.backend.dto.response.*;
import com.team_ecommerce.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
class AnalyticsController {
    private final AnalyticsService analyticsService;
 
    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<?>> bestSellers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Best sellers",
            analyticsService.getBestSellers(limit)));
    }
}
