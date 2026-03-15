package com.team_ecommerce.backend.repository;

import java.util.Optional;
import com.team_ecommerce.backend.entity.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface SellerWalletRepository extends MongoRepository<SellerWallet, String> {
    Optional<SellerWallet> findBySellerId(String sellerId);
}
