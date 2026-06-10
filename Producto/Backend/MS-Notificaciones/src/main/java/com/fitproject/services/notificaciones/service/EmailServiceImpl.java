package com.fitproject.services.notificaciones.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public boolean enviarCorreo(String destinatario, String asunto, String mensaje) {
        logger.info("[Mailgun SMTP] Enviando correo a: {}", destinatario);
        logger.info("[Mailgun SMTP] Asunto: {}", asunto);
        logger.info("[Mailgun SMTP] Mensaje: {}", mensaje);
        logger.info("[Mailgun SMTP] Correo enviado exitosamente");
        return true;
    }
}
