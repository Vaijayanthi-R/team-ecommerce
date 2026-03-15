package com.team_ecommerce.backend.controller;

import com.team_ecommerce.backend.dto.response.*;
import com.team_ecommerce.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
class ProductController {
    private final ProductService productService;
    private final ProductFilterService filterService;
 
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> list(
            @RequestParam(required = false) String search) {
        var result = search != null && !search.isBlank()
            ? productService.search(search)
            : productService.getActiveProducts();
        return ResponseEntity.ok(ApiResponse.ok("Products fetched", result));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getOne(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Product fetched", productService.getById(id)));
    }
 
    @GetMapping("/image/{fileId}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileId) throws Exception {
        byte[] data = productService.getProductImage(fileId);
        String ct   = productService.getImageContentType(fileId);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(ct))
            .body(data);
    }
 
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<?>> filter(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size) {
 
        var params = new ProductFilterService.FilterParams(
            search, category, minPrice, maxPrice, minRating, sortBy, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Products filtered",
            filterService.filterProducts(params)));
    }
 
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<?>> categories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories fetched",
            filterService.getAllCategories()));
    }
}