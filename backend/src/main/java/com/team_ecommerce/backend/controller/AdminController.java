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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
class AdminController {
    private final SellerService sellerService;
    private final ProductService productService;
 
    // ── Sellers ───────────────────────────────────────────────────────────
    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<?>> allSellers() {
        return ResponseEntity.ok(ApiResponse.ok("Sellers fetched",
            sellerService.getAllSellers()));
    }
 
    @GetMapping("/sellers/pending")
    public ResponseEntity<ApiResponse<?>> pendingSellers() {
        return ResponseEntity.ok(ApiResponse.ok("Pending sellers",
            sellerService.getPendingSellers()));
    }
 
    @PutMapping("/sellers/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approveSeller(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Seller approved",
            sellerService.approveSeller(id, auth.getName())));
    }
 
    @PutMapping("/sellers/{id}/reject")
    public ResponseEntity<ApiResponse<?>> rejectSeller(
            Authentication auth, @PathVariable String id,
            @RequestBody AdminRemarkRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Seller rejected",
            sellerService.rejectSeller(id, auth.getName(), req.getRemarks())));
    }
 
    @GetMapping("/sellers/certificates/{fileId}")
    public ResponseEntity<byte[]> viewCertificate(@PathVariable String fileId) throws Exception {
        byte[] data = sellerService.getCertificateFile(fileId);
        String ct   = sellerService.getCertContentType(fileId);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(ct))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=certificate")
            .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store")
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Headers", "Authorization, Content-Type")
            .body(data);
    }
 
    // ── Products — new listings ───────────────────────────────────────────
    @GetMapping("/products/pending")
    public ResponseEntity<ApiResponse<?>> pendingProducts() {
        return ResponseEntity.ok(ApiResponse.ok("Pending products",
            productService.getPendingProducts()));
    }
 
    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approveProduct(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Product approved",
            productService.approveProduct(id, auth.getName())));
    }
 
    @PutMapping("/products/{id}/reject")
    public ResponseEntity<ApiResponse<?>> rejectProduct(
            Authentication auth, @PathVariable String id,
            @RequestBody AdminRemarkRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Product rejected",
            productService.rejectProduct(id, auth.getName(), req.getRemarks())));
    }
 
    // ── Products — seller update requests ────────────────────────────────
    @GetMapping("/products/pending-updates")
    public ResponseEntity<ApiResponse<?>> pendingUpdates() {
        return ResponseEntity.ok(ApiResponse.ok("Pending updates",
            productService.getProductsWithPendingUpdates()));
    }
 
    @PutMapping("/products/{id}/approve-update")
    public ResponseEntity<ApiResponse<?>> approveUpdate(
            Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Update approved",
            productService.approveUpdate(id, auth.getName())));
    }
 
    @PutMapping("/products/{id}/reject-update")
    public ResponseEntity<ApiResponse<?>> rejectUpdate(
            Authentication auth, @PathVariable String id,
            @RequestBody AdminRemarkRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Update rejected",
            productService.rejectUpdate(id, auth.getName(), req.getRemarks())));
    }
}
