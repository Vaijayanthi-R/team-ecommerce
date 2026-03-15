package com.team_ecommerce.backend.repository;

import java.util.List;
import com.team_ecommerce.backend.entity.WalletTransaction;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface WalletTransactionRepository extends MongoRepository<WalletTransaction, String> {
    List<WalletTransaction> findBySellerIdOrderByCreatedAtDesc(String sellerId);
}
