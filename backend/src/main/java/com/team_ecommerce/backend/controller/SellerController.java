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
@RequestMapping("/api/seller")
@RequiredArgsConstructor
class SellerController {
    private final SellerService sellerService;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final AnalyticsService analyticsService;
    private final NotificationService notifService;
 
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SellerResponse>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched",
            sellerService.getMyProfile(auth.getName())));
    }
 
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<SellerResponse>> updateProfile(
            Authentication auth, @Valid @RequestBody SellerProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated",
            sellerService.updateProfile(auth.getName(), req)));
    }
 
    @PostMapping("/certificates")
    public ResponseEntity<ApiResponse<SellerResponse>> uploadCert(
            Authentication auth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("certType") String certType) throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("Certificate uploaded",
            sellerService.uploadCertificate(auth.getName(), file, certType)));
    }
 
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> myProducts(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Products fetched",
            productService.getMyProducts(auth.getName())));
    }
 
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> addProduct(
            Authentication auth,
            @RequestPart("product") @Valid ProductRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images)
            throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Product submitted for approval",
                productService.createProduct(auth.getName(), req, images)));
    }
 
    @PutMapping(value = "/products/{productId}/update",
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<?>> submitUpdate(
            Authentication auth,
            @PathVariable String productId,
            @RequestPart("product") @Valid ProductRequest req,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "sellerNote", required = false, defaultValue = "") String note)
            throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("Update submitted for admin review",
            productService.submitUpdate(productId, auth.getName(), req, images, note)));
    }
 
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            Authentication auth, @PathVariable String productId) {
        productService.deleteProduct(productId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Product deleted"));
    }
 
    @GetMapping("/wallet")
    public ResponseEntity<ApiResponse<?>> getWallet(Authentication auth) {
        var seller = sellerService.getMyProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Wallet fetched",
            paymentService.getWallet(seller.getId())));
    }
 
    @GetMapping("/wallet/transactions")
    public ResponseEntity<ApiResponse<?>> getTransactions(Authentication auth) {
        var seller = sellerService.getMyProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Transactions fetched",
            paymentService.getTransactions(seller.getId())));
    }
 
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<?>> getAnalytics(Authentication auth) {
        var seller = sellerService.getMyProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Analytics fetched",
            analyticsService.getSellerAnalytics(seller.getId())));
    }
 
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<?>> getNotifications(Authentication auth) {
        var seller = sellerService.getMyProfile(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Notifications fetched",
            notifService.getForRecipient(seller.getId())));
    }
 
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable String id) {
        notifService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read"));
    }
}