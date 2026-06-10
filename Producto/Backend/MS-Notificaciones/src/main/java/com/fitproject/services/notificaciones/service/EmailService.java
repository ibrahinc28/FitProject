package com.fitproject.services.notificaciones.service;

public interface EmailService {
    boolean enviarCorreo(String destinatario, String asunto, String mensaje);

    default void sendEmail(String to, String subject, String body) {
        enviarCorreo(to, subject, body);
    }
}
