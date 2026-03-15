package com.team_ecommerce.backend.entity;



import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
 
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id private String id;
    private String action;               // e.g. "ORDER_STATUS_CHANGED"
    private String entityId;             // orderId, productId, etc.
    private String performedBy;          // userId
    private String detail;               // human-readable description
    @Builder.Default private LocalDateTime timestamp = LocalDateTime.now();
}
