package com.team_ecommerce.backend.service;
//notification
import com.team_ecommerce.backend.enums.NotifType;
import com.team_ecommerce.backend.entity.*;
import com.team_ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final JavaMailSender mailSender;

    public Notification create(String recipientId, String message, NotifType type) {
        Notification n = Notification.builder()
            .recipientId(recipientId)
            .message(message)
            .type(type)
            .build();
        return notifRepo.save(n);
    }

    public List<Notification> getForRecipient(String recipientId) {
        return notifRepo.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    public long countUnread(String recipientId) {
        return notifRepo.countByRecipientIdAndReadFalse(recipientId);
    }

    public void markRead(String notifId) {
        notifRepo.findById(notifId).ifPresent(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
    }

    public void markAllRead(String recipientId) {
        notifRepo.findByRecipientIdAndReadFalse(recipientId).forEach(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
    }

    @Async
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(toEmail);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", toEmail, e.getMessage());
        }
    }
}