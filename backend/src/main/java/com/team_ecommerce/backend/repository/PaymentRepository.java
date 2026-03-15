package com.team_ecommerce.backend.repository;

import java.util.Optional;
import com.team_ecommerce.backend.entity.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByStripePaymentIntentId(String intentId);
}