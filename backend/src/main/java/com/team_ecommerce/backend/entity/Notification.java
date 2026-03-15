package com.team_ecommerce.backend.entity;

import com.team_ecommerce.backend.enums.NotifType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
 
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id private String id;
    private String recipientId;          // userId or sellerId
    private String message;
    private NotifType type;
    @Builder.Default private boolean read = false;
    @Builder.Default private LocalDateTime createdAt = LocalDateTime.now();
}