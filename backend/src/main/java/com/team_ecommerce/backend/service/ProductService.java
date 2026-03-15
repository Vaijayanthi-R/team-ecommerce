package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.request.ProductRequest;
import com.team_ecommerce.backend.dto.response.ProductResponse;
import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.enums.ProductStatus;
import com.team_ecommerce.backend.enums.SellerStatus;
import com.team_ecommerce.backend.entity.Product;
import com.team_ecommerce.backend.entity.Seller;
import com.team_ecommerce.backend.entity.User;
import com.team_ecommerce.backend.repository.ProductRepository;
import com.team_ecommerce.backend.repository.SellerRepository;
import com.team_ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final SellerRepository sellerRepo;
    private final UserRepository userRepo;
    private final GridFsService gridFsService;
    private final NotificationService notifService;
    private final AuditLogService auditLog;

    // ── Seller: create ────────────────────────────────────────────────────────

    public ProductResponse createProduct(String userId, ProductRequest req,
                                          List<MultipartFile> images) throws IOException {
        Seller seller = sellerRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        if (seller.getStatus() != SellerStatus.APPROVED)
            throw new RuntimeException("Seller account not yet approved by admin");

        if (productRepo.existsByNameIgnoreCase(req.getName()))
            throw new RuntimeException(
                "Product name '" + req.getName() + "' is already taken. Please use a unique name.");

        User user = userRepo.findById(userId).orElseThrow();

        List<String> imageIds = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images)
                imageIds.add(gridFsService.store(img, "product-image"));
        }

        Product product = Product.builder()
            .name(req.getName())
            .description(req.getDescription())
            .category(req.getCategory())
            .price(req.getPrice())
            .availableQuantity(req.getAvailableQuantity())
            .sellerId(seller.getId())
            .sellerName(seller.getBusinessName() != null
                ? seller.getBusinessName() : user.getFirstName())
            .imageFileIds(imageIds)
            .discountPercent(req.getDiscountPercent())
            .status(ProductStatus.PENDING)
            .build();

        product = productRepo.save(product);

        auditLog.log("PRODUCT_CREATED", product.getId(), userId,
            "Product submitted for approval: " + product.getName());

        return ProductResponse.from(product);
    }

    // ── Seller: submit update (goes to pending, live product unchanged) ────────

    public ProductResponse submitUpdate(String productId, String userId,
                                         ProductRequest req,
                                         List<MultipartFile> newImages,
                                         String sellerNote) throws IOException {
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        Seller seller = sellerRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (!product.getSellerId().equals(seller.getId()))
            throw new RuntimeException("Not your product");

        if (product.getStatus() != ProductStatus.ACTIVE)
            throw new RuntimeException("Only ACTIVE products can be updated");

        // Unique name check — exclude self
        if (!product.getName().equalsIgnoreCase(req.getName()) &&
                productRepo.existsByNameIgnoreCaseAndIdNot(req.getName(), productId))
            throw new RuntimeException("Product name '" + req.getName() + "' is already taken");

        // Upload any new images for the pending update
        List<String> pendingImageIds = new ArrayList<>(product.getImageFileIds());
        if (newImages != null && !newImages.isEmpty()) {
            pendingImageIds = new ArrayList<>();
            for (MultipartFile img : newImages)
                pendingImageIds.add(gridFsService.store(img, "product-image"));
        }

        Product.PendingUpdate pending = Product.PendingUpdate.builder()
            .name(req.getName())
            .description(req.getDescription())
            .category(req.getCategory())
            .price(req.getPrice())
            .availableQuantity(req.getAvailableQuantity())
            .discountPercent(req.getDiscountPercent())
            .imageFileIds(pendingImageIds)
            .submittedAt(LocalDateTime.now())
            .sellerNote(sellerNote)
            .build();

        product.setPendingUpdate(pending);
        product.setHasPendingUpdate(true);
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);

        auditLog.log("PRODUCT_UPDATE_SUBMITTED", productId, userId,
            "Update submitted for: " + product.getName());

        return ProductResponse.from(product);
    }

    // ── Admin: approve update — apply pending changes to live product ──────────

    public ProductResponse approveUpdate(String productId, String adminId) {
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isHasPendingUpdate() || product.getPendingUpdate() == null)
            throw new RuntimeException("No pending update for this product");

        Product.PendingUpdate upd = product.getPendingUpdate();

        // Apply all pending changes to live fields
        product.setName(upd.getName());
        product.setDescription(upd.getDescription());
        product.setCategory(upd.getCategory());
        product.setPrice(upd.getPrice());
        product.setAvailableQuantity(upd.getAvailableQuantity());
        product.setDiscountPercent(upd.getDiscountPercent());
        product.setImageFileIds(upd.getImageFileIds());

        // Clear pending
        product.setPendingUpdate(null);
        product.setHasPendingUpdate(false);
        product.setAdminRemarks(null);
        product.setApprovedByAdminId(adminId);
        product.setUpdatedAt(LocalDateTime.now());

        productRepo.save(product);

        notifService.create(product.getSellerId(),
            "✅ Your update for \"" + product.getName() + "\" has been approved and is now live!",
            NotifType.PRODUCT_APPROVED);

        auditLog.log("PRODUCT_UPDATE_APPROVED", productId, adminId,
            "Update approved for: " + product.getName());

        return ProductResponse.from(product);
    }

    // ── Admin: reject update — discard pending, keep live product as-is ────────

    public ProductResponse rejectUpdate(String productId, String adminId, String remarks) {
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isHasPendingUpdate())
            throw new RuntimeException("No pending update for this product");

        product.setPendingUpdate(null);
        product.setHasPendingUpdate(false);
        product.setAdminRemarks(remarks);
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);

        notifService.create(product.getSellerId(),
            "❌ Update for \"" + product.getName() + "\" was rejected. Reason: " + remarks,
            NotifType.PRODUCT_REJECTED);

        auditLog.log("PRODUCT_UPDATE_REJECTED", productId, adminId,
            "Update rejected for: " + product.getName() + " | " + remarks);

        return ProductResponse.from(product);
    }

    // ── Seller: delete ────────────────────────────────────────────────────────

    public void deleteProduct(String productId, String userId) {
        Product product = productRepo.findById(productId).orElseThrow();
        Seller seller = sellerRepo.findByUserId(userId).orElseThrow();

        if (!product.getSellerId().equals(seller.getId()))
            throw new RuntimeException("Not your product");

        productRepo.delete(product);
        auditLog.log("PRODUCT_DELETED", productId, userId, "Product deleted: " + product.getName());
    }

    // ── Public ────────────────────────────────────────────────────────────────

    public List<ProductResponse> getMyProducts(String userId) {
        Seller seller = sellerRepo.findByUserId(userId).orElseThrow();
        return productRepo.findBySellerId(seller.getId())
            .stream().map(ProductResponse::from).toList();
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepo.findByStatus(ProductStatus.ACTIVE)
            .stream().map(ProductResponse::from).toList();
    }

    public List<ProductResponse> getBestSellers() {
        return productRepo.findByBestSellerTrueOrderByBestSellerRankAsc()
            .stream().map(ProductResponse::from).toList();
    }

    public List<ProductResponse> search(String keyword) {
        return productRepo.searchActive(keyword)
            .stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getById(String id) {
        return ProductResponse.from(productRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found")));
    }

    // ── Admin: initial approve / reject ──────────────────────────────────────

    public List<ProductResponse> getPendingProducts() {
        return productRepo.findByStatus(ProductStatus.PENDING)
            .stream().map(ProductResponse::from).toList();
    }

    public List<ProductResponse> getProductsWithPendingUpdates() {
        return productRepo.findByHasPendingUpdateTrue()
            .stream().map(ProductResponse::from).toList();
    }

    public ProductResponse approveProduct(String productId, String adminId) {
        Product product = productRepo.findById(productId).orElseThrow();
        product.setStatus(ProductStatus.ACTIVE);
        product.setApprovedByAdminId(adminId);
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);

        notifService.create(product.getSellerId(),
            "✅ Your product \"" + product.getName() + "\" has been approved and is now live!",
            NotifType.PRODUCT_APPROVED);

        auditLog.log("PRODUCT_APPROVED", productId, adminId,
            "Product approved: " + product.getName());

        return ProductResponse.from(product);
    }

    public ProductResponse rejectProduct(String productId, String adminId, String remarks) {
        Product product = productRepo.findById(productId).orElseThrow();
        product.setStatus(ProductStatus.REJECTED);
        product.setAdminRemarks(remarks);
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);

        notifService.create(product.getSellerId(),
            "❌ Product \"" + product.getName() + "\" was rejected. Reason: " + remarks,
            NotifType.PRODUCT_REJECTED);

        auditLog.log("PRODUCT_REJECTED", productId, adminId,
            "Product rejected: " + product.getName() + " | " + remarks);

        return ProductResponse.from(product);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    public void decrementStock(String productId, int quantity) {
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (product.getAvailableQuantity() < quantity)
            throw new RuntimeException("Insufficient stock for: " + product.getName());

        product.setAvailableQuantity(product.getAvailableQuantity() - quantity);

        if (product.getAvailableQuantity() == 0)
            product.setStatus(ProductStatus.OUT_OF_STOCK);

        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);
    }

    public void incrementStock(String productId, int quantity) {
        Product product = productRepo.findById(productId).orElseThrow();
        product.setAvailableQuantity(product.getAvailableQuantity() + quantity);
        if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getAvailableQuantity() > 0)
            product.setStatus(ProductStatus.ACTIVE);
        product.setUpdatedAt(LocalDateTime.now());
        productRepo.save(product);
    }

    public byte[] getProductImage(String fileId) throws IOException {
        return gridFsService.retrieve(fileId);
    }

    public String getImageContentType(String fileId) {
        return gridFsService.getContentType(fileId);
    }
}