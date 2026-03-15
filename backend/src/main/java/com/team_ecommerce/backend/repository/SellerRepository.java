package com.team_ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.team_ecommerce.backend.entity.Seller;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.team_ecommerce.backend.enums.SellerStatus;


@Repository
public interface SellerRepository extends MongoRepository<Seller, String> {
    Optional<Seller> findByUserId(String userId);
    List<Seller> findByStatus(SellerStatus status);
    boolean existsByUserId(String userId);
}
