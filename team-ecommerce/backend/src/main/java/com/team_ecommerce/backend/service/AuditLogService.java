package com.team_ecommerce.backend.service;
//auidtlog
import com.team_ecommerce.backend.entity.AuditLog;
import com.team_ecommerce.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepo;

    public void log(String action, String entityId, String performedBy, String detail) {
        AuditLog log = AuditLog.builder()
            .action(action)
            .entityId(entityId)
            .performedBy(performedBy)
            .detail(detail)
            .build();
        auditLogRepo.save(log);
    }

    public List<AuditLog> getAll() {
        return auditLogRepo.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getByUser(String userId) {
        return auditLogRepo.findByPerformedByOrderByTimestampDesc(userId);
    }
}