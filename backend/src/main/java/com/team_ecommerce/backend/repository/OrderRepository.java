package com.team_ecommerce.backend.repository;

import java.util.List;
import com.team_ecommerce.backend.entity.Order;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.team_ecommerce.backend.enums.OrderStatus;


@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByStatus(OrderStatus status);
    @Query("{ 'items.sellerId': ?0 }")
    List<Order> findBySellerIdInItems(String sellerId);
    @Query("{ 'items.sellerId': ?0, 'status': ?1 }")
    List<Order> findBySellerIdAndStatus(String sellerId, OrderStatus status);
}