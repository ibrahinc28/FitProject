package com.fitproject.services.notificaciones.service;

import com.fitproject.services.notificaciones.dto.AlertaRequest;
import com.fitproject.services.notificaciones.model.Notificacion;
import com.fitproject.services.notificaciones.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final EmailService emailService;

    @Autowired
    public NotificacionService(NotificacionRepository notificacionRepository, EmailService emailService) {
        this.notificacionRepository = notificacionRepository;
        this.emailService = emailService;
    }

    public Notificacion procesarAlerta(AlertaRequest alertaRequest) {
        String mensaje = String.format("El hito '%s' ha sido completado al 100%%. Por favor revise el avance de la obra.",
                alertaRequest.getNombreHito());
        
        Notificacion notificacion = new Notificacion();
        notificacion.setCorreoDestinatario(alertaRequest.getCorreoSupervisor());
        notificacion.setMensaje(mensaje);
        notificacion.setTipoAlerta("AVANCE_OBRA");
        notificacion.setEstado("PENDIENTE");

        boolean enviado = emailService.enviarCorreo(
                alertaRequest.getCorreoSupervisor(),
                "Alerta de Avance de Obra - Hito Completado",
                mensaje
        );

        if (enviado) {
            notificacion.setEstado("ENVIADO");
        }

        return notificacionRepository.save(notificacion);
    }

    public java.util.List<Notificacion> obtenerTodasLasNotificaciones() {
        return notificacionRepository.findAll();
    }
}
