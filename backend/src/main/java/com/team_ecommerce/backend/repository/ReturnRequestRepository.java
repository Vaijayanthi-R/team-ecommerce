package com.team_ecommerce.backend.repository;

import java.util.*;
import com.team_ecommerce.backend.entity.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface ReturnRequestRepository extends MongoRepository<ReturnRequest, String> {
    List<ReturnRequest> findByUserId(String userId);
    List<ReturnRequest> findByStatus(String status);
    Optional<ReturnRequest> findByOrderIdAndProductId(String orderId, String productId);
}