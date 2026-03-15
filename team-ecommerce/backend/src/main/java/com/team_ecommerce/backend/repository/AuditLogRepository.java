package com.team_ecommerce.backend.repository;
//audilog
import java.util.List;
import org.springframework.stereotype.Repository;
import com.team_ecommerce.backend.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String userId);
    List<AuditLog> findAllByOrderByTimestampDesc();
}