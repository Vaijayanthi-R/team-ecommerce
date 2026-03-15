package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.enums.OrderStatus;
import com.team_ecommerce.backend.entity.Order;
import com.team_ecommerce.backend.entity.Review;
import com.team_ecommerce.backend.repository.OrderRepository;
import com.team_ecommerce.backend.repository.ProductRepository;
import com.team_ecommerce.backend.repository.ReviewRepository;
import com.team_ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
 
import java.time.LocalDateTime;
import java.util.List;
import java.util.OptionalDouble;
 
@Service
@RequiredArgsConstructor
public class ReviewService {
 
    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
 
    /**
     * User can only review a product if they have a DELIVERED order containing it.
     */
    public boolean canReview(String userId, String productId) {
        return orderRepo.findByUserId(userId).stream()
            .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
            .flatMap(o -> o.getItems().stream())
            .anyMatch(item -> item.getProductId().equals(productId));
    }
 
    public boolean hasAlreadyReviewed(String userId, String productId) {
        return reviewRepo.existsByUserIdAndProductId(userId, productId);
    }
 
    public Review submitReview(String userId, String productId,
                                int rating, String comment) {
        if (rating < 1 || rating > 5)
            throw new RuntimeException("Rating must be between 1 and 5");
 
        if (!canReview(userId, productId))
            throw new RuntimeException("You can only review products from delivered orders");
 
        if (hasAlreadyReviewed(userId, productId))
            throw new RuntimeException("You have already reviewed this product");
 
        // Find the delivered order containing this product
        String orderId = orderRepo.findByUserId(userId).stream()
            .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
            .filter(o -> o.getItems().stream()
                .anyMatch(i -> i.getProductId().equals(productId)))
            .findFirst()
            .map(Order::getId)
            .orElseThrow();
 
        var user = userRepo.findById(userId).orElseThrow();
 
        Review review = Review.builder()
            .productId(productId)
            .userId(userId)
            .userName(user.getFirstName() + " " + user.getLastName())
            .orderId(orderId)
            .rating(rating)
            .comment(comment)
            .build();
 
        review = reviewRepo.save(review);
        recalculateProductRating(productId);
        return review;
    }
 
    public Review updateReview(String reviewId, String userId,
                                int rating, String comment) {
        if (rating < 1 || rating > 5)
            throw new RuntimeException("Rating must be between 1 and 5");
 
        Review review = reviewRepo.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
 
        if (!review.getUserId().equals(userId))
            throw new RuntimeException("Not your review");
 
        review.setRating(rating);
        review.setComment(comment);
        review.setUpdatedAt(LocalDateTime.now());
 
        review = reviewRepo.save(review);
        recalculateProductRating(review.getProductId());
        return review;
    }
 
    public void deleteReview(String reviewId, String userId) {
        Review review = reviewRepo.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
 
        if (!review.getUserId().equals(userId))
            throw new RuntimeException("Not your review");
 
        String productId = review.getProductId();
        reviewRepo.delete(review);
        recalculateProductRating(productId);
    }
 
    public List<Review> getProductReviews(String productId) {
        return reviewRepo.findByProductIdOrderByCreatedAtDesc(productId);
    }
 
    public List<Review> getMyReviews(String userId) {
        return reviewRepo.findByUserId(userId);
    }
 
    /**
     * Recalculates and persists average rating + review count on the product.
     */
    private void recalculateProductRating(String productId) {
        List<Review> reviews = reviewRepo.findByProductIdOrderByCreatedAtDesc(productId);
 
        OptionalDouble avg = reviews.stream()
            .mapToInt(Review::getRating)
            .average();
 
        productRepo.findById(productId).ifPresent(product -> {
            product.setAverageRating(avg.isPresent()
                ? Math.round(avg.getAsDouble() * 10.0) / 10.0  // round to 1 decimal
                : 0.0);
            product.setTotalReviews(reviews.size());
            productRepo.save(product);
        });
    }
}