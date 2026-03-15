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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
class PaymentController {
    private final PaymentService paymentService;
 
    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<Map<String, String>>> initiate(
            Authentication auth, @RequestBody PaymentRequest req) throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("Payment intent created",
            paymentService.createPaymentIntent(req.getOrderId(), auth.getName())));
    }
 
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws Exception {
        paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("OK");
    }
}