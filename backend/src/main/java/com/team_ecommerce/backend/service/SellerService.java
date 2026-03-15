package com.team_ecommerce.backend.service;

import com.team_ecommerce.backend.dto.request.SellerProfileRequest;
import com.team_ecommerce.backend.dto.response.SellerResponse;
import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.enums.SellerStatus;
import com.team_ecommerce.backend.entity.Seller;
import com.team_ecommerce.backend.repository.SellerRepository;
import com.team_ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepo;
    private final UserRepository userRepo;
    private final GridFsService gridFsService;
    private final NotificationService notifService;
    private final AuditLogService auditLog;

    public SellerResponse getMyProfile(String userId) {
        Seller seller = sellerRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        return SellerResponse.from(seller);
    }

    public SellerResponse updateProfile(String userId, SellerProfileRequest req) {
        Seller seller = sellerRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        seller.setBusinessName(req.getBusinessName());
        seller.setBusinessEmail(req.getBusinessEmail());
        seller.setPhone(req.getPhone());
        seller.setAddress(req.getAddress());
        seller.setGstNumber(req.getGstNumber());
        seller.setUpdatedAt(LocalDateTime.now());

        return SellerResponse.from(sellerRepo.save(seller));
    }

    public SellerResponse uploadCertificate(String userId, MultipartFile file,
                                             String certType) throws IOException {
        Seller seller = sellerRepo.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        String fileId = gridFsService.store(file, "certificate");

        Seller.CertificateFile cert = Seller.CertificateFile.builder()
            .fileId(fileId)
            .fileName(file.getOriginalFilename())
            .certType(certType)
            .uploadedAt(LocalDateTime.now())
            .build();

        seller.getCertificates().add(cert);
        seller.setUpdatedAt(LocalDateTime.now());

        auditLog.log("CERT_UPLOADED", seller.getId(), userId,
            "Certificate uploaded: " + certType);

        return SellerResponse.from(sellerRepo.save(seller));
    }

    // ── Admin actions ─────────────────────────────────────────────────────────

    public List<SellerResponse> getPendingSellers() {
        return sellerRepo.findByStatus(SellerStatus.PENDING)
            .stream().map(SellerResponse::from).toList();
    }

    public List<SellerResponse> getAllSellers() {
        return sellerRepo.findAll().stream().map(SellerResponse::from).toList();
    }

    public SellerResponse approveSeller(String sellerId, String adminId) {
        Seller seller = sellerRepo.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        seller.setStatus(SellerStatus.APPROVED);
        seller.setApprovedByAdminId(adminId);
        seller.setUpdatedAt(LocalDateTime.now());
        sellerRepo.save(seller);

        notifService.create(seller.getUserId(),
            "🎉 Your seller account has been approved! You can now list products.",
            NotifType.SELLER_APPROVED);

        auditLog.log("SELLER_APPROVED", sellerId, adminId,
            "Seller approved: " + seller.getBusinessName());

        return SellerResponse.from(seller);
    }

    public SellerResponse rejectSeller(String sellerId, String adminId, String remarks) {
        Seller seller = sellerRepo.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        seller.setStatus(SellerStatus.REJECTED);
        seller.setAdminRemarks(remarks);
        seller.setUpdatedAt(LocalDateTime.now());
        sellerRepo.save(seller);

        notifService.create(seller.getUserId(),
            "Your seller application was rejected. Reason: " + remarks,
            NotifType.SELLER_REJECTED);

        auditLog.log("SELLER_REJECTED", sellerId, adminId,
            "Seller rejected: " + seller.getBusinessName() + " | Reason: " + remarks);

        return SellerResponse.from(seller);
    }

    public byte[] getCertificateFile(String fileId) throws IOException {
        return gridFsService.retrieve(fileId);
    }

    public String getCertContentType(String fileId) {
        return gridFsService.getContentType(fileId);
    }

    public boolean isApproved(String userId) {
        return sellerRepo.findByUserId(userId)
            .map(s -> s.getStatus() == SellerStatus.APPROVED)
            .orElse(false);
    }
}