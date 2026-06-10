package com.fitproject.services.notificaciones.messaging;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String recipientEmail;
    private String recipientName;
    private String subject;
    private String body;
    private String eventType;
}