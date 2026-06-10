package com.fitproject.services.notificaciones.messaging;

import com.fitproject.services.notificaciones.config.RabbitMQConfig;
import com.fitproject.services.notificaciones.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.EVIDENCE_APPROVED_QUEUE)
    public void handleEvidenceApproved(NotificationEvent event) {
        log.info("Evidence approved event received for: {}", event.getRecipientEmail());
        emailService.sendEmail(event.getRecipientEmail(), event.getSubject(), event.getBody());
    }

    @RabbitListener(queues = RabbitMQConfig.SALE_CONFIRMED_QUEUE)
    public void handleSaleConfirmed(NotificationEvent event) {
        log.info("Sale confirmed event received for: {}", event.getRecipientEmail());
        emailService.sendEmail(event.getRecipientEmail(), event.getSubject(), event.getBody());
    }
}