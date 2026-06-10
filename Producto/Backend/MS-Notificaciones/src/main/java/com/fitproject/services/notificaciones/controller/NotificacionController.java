package com.fitproject.services.notificaciones.controller;

import com.fitproject.services.notificaciones.dto.AlertaRequest;
import com.fitproject.services.notificaciones.model.Notificacion;
import com.fitproject.services.notificaciones.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @Autowired
    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @PostMapping("/enviar-alerta")
    public ResponseEntity<Notificacion> enviarAlerta(@RequestBody AlertaRequest alertaRequest) {
        Notificacion notificacion = notificacionService.procesarAlerta(alertaRequest);
        return ResponseEntity.ok(notificacion);
    }

    @GetMapping
    public ResponseEntity<List<Notificacion>> obtenerTodasLasNotificaciones() {
        List<Notificacion> notificaciones = notificacionService.obtenerTodasLasNotificaciones();
        return ResponseEntity.ok(notificaciones);
    }
}
