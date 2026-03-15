package com.team_ecommerce.backend.repository;

import java.util.List;
import com.team_ecommerce.backend.enums.ProductStatus;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.team_ecommerce.backend.entity.Product;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByStatus(ProductStatus status);
    List<Product> findBySellerId(String sellerId);
    List<Product> findBySellerIdAndStatus(String sellerId, ProductStatus status);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);
    List<Product> findByBestSellerTrueOrderByBestSellerRankAsc();
    List<Product> findByHasPendingUpdateTrue(); 
    List<Product> findByStatusOrderByTotalUnitsSoldDesc(ProductStatus status);
    @Query("{ 'status': 'ACTIVE', $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'category': { $regex: ?0, $options: 'i' } } ] }")
    List<Product> searchActive(String keyword);
}
