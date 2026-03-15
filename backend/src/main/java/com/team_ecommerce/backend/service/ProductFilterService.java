package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.response.ProductResponse;
import com.team_ecommerce.backend.enums.ProductStatus;
import com.team_ecommerce.backend.entity.Product;
import com.team_ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class ProductFilterService {
 
    private final MongoTemplate mongoTemplate;
    private final ProductRepository productRepo;
 
    public record FilterParams(
        String search,
        String category,
        Double minPrice,
        Double maxPrice,
        Double minRating,
        String sortBy,       // price_asc, price_desc, rating, newest, popular
        int page,
        int size
    ) {}
 
    public record PagedResult<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrev
    ) {}
 
    public PagedResult<ProductResponse> filterProducts(FilterParams params) {
        Query query = new Query();
 
        // Always only ACTIVE products for public listing
        Criteria criteria = Criteria.where("status").is(ProductStatus.ACTIVE.name());
 
        // Search by name or category
        if (params.search() != null && !params.search().isBlank()) {
            criteria = criteria.andOperator(
                Criteria.where("status").is(ProductStatus.ACTIVE.name()),
                new Criteria().orOperator(
                    Criteria.where("name").regex(params.search(), "i"),
                    Criteria.where("description").regex(params.search(), "i"),
                    Criteria.where("category").regex(params.search(), "i"),
                    Criteria.where("sellerName").regex(params.search(), "i")
                )
            );
        }
 
        // Category filter
        if (params.category() != null && !params.category().isBlank()
                && !params.category().equalsIgnoreCase("all")) {
            criteria = criteria.and("category").regex(params.category(), "i");
        }
 
        // Price range
        if (params.minPrice() != null) {
            criteria = criteria.and("price").gte(params.minPrice());
        }
        if (params.maxPrice() != null) {
            criteria = criteria.and("price").lte(params.maxPrice());
        }
 
        // Minimum rating filter
        if (params.minRating() != null && params.minRating() > 0) {
            criteria = criteria.and("averageRating").gte(params.minRating());
        }
 
        query.addCriteria(criteria);
 
        // Count total before pagination
        long total = mongoTemplate.count(query, Product.class);
 
        // Sorting
        Sort sort = switch (params.sortBy() != null ? params.sortBy() : "newest") {
            case "price_asc"  -> Sort.by(Sort.Direction.ASC,  "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating"     -> Sort.by(Sort.Direction.DESC, "averageRating");
            case "popular"    -> Sort.by(Sort.Direction.DESC, "totalUnitsSold");
            case "discount"   -> Sort.by(Sort.Direction.DESC, "discountPercent");
            default           -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
 
        // Pagination
        int size = Math.min(params.size(), 50);   // max 50 per page
        int page = Math.max(params.page(), 0);
        query.with(PageRequest.of(page, size, sort));
 
        List<Product> products = mongoTemplate.find(query, Product.class);
        int totalPages = (int) Math.ceil((double) total / size);
 
        List<ProductResponse> content = products.stream()
            .map(ProductResponse::from)
            .toList();
 
        return new PagedResult<>(
            content, page, size, total, totalPages,
            page < totalPages - 1,
            page > 0
        );
    }
 
    public List<String> getAllCategories() {
        return mongoTemplate.findDistinct(
            new Query(Criteria.where("status").is(ProductStatus.ACTIVE.name())),
            "category",
            Product.class,
            String.class
        );
    }
}