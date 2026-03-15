package com.team_ecommerce.backend.repository;

import com.team_ecommerce.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Order save(Order order);
}