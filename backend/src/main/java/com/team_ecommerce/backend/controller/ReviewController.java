package com.team_ecommerce.backend.controller;

import com.team_ecommerce.backend.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
class ReviewController {
 
    private final com.team_ecommerce.backend.service.ReviewService reviewService;
 
    // Public — anyone can read reviews
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<?>> getProductReviews(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews fetched",
            reviewService.getProductReviews(productId)));
    }
 
    // Check if logged-in user can review this product
    @GetMapping("/product/{productId}/eligibility")
    public ResponseEntity<ApiResponse<?>> checkEligibility(
            Authentication auth, @PathVariable String productId) {
        boolean canReview    = reviewService.canReview(auth.getName(), productId);
        boolean alreadyDone  = reviewService.hasAlreadyReviewed(auth.getName(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Eligibility checked",
            java.util.Map.of("canReview", canReview, "alreadyReviewed", alreadyDone)));
    }
 
    // Submit a review
    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<?>> submit(
            Authentication auth,
            @PathVariable String productId,
            @RequestParam int rating,
            @RequestParam(required = false, defaultValue = "") String comment) {
        return ResponseEntity.ok(ApiResponse.ok("Review submitted",
            reviewService.submitReview(auth.getName(), productId, rating, comment)));
    }
 
    // Edit own review
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<?>> update(
            Authentication auth,
            @PathVariable String reviewId,
            @RequestParam int rating,
            @RequestParam(required = false, defaultValue = "") String comment) {
        return ResponseEntity.ok(ApiResponse.ok("Review updated",
            reviewService.updateReview(reviewId, auth.getName(), rating, comment)));
    }
 
    // Delete own review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth, @PathVariable String reviewId) {
        reviewService.deleteReview(reviewId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Review deleted"));
    }
 
    // My reviews
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<?>> myReviews(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("My reviews",
            reviewService.getMyReviews(auth.getName())));
    }
}
