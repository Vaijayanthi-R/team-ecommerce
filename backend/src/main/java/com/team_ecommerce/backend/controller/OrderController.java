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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
class OrderController {
    private final OrderService orderService;
 
    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            Authentication auth, @Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Order placed", orderService.createOrder(auth.getName(), req)));
    }
 
    @GetMapping
    public ResponseEntity<ApiResponse<?>> myOrders(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched",
            orderService.getMyOrders(auth.getName())));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getOne(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Order fetched", orderService.getById(id)));
    }
 
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancel(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled",
            orderService.cancelOrder(id, auth.getName())));
    }
 
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            Authentication auth, @PathVariable String id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
            orderService.updateStatus(id, status, auth.getName())));
    }
 
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> allOrders() {
        return ResponseEntity.ok(ApiResponse.ok("All orders", orderService.getAllOrders()));
    }
}