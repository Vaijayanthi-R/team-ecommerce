package com.team_ecommerce.backend.repository;

import java.util.List;
import com.team_ecommerce.backend.entity.Notification;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;


@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientIdAndReadFalse(String recipientId);
    long countByRecipientIdAndReadFalse(String recipientId);
}