package com.fitproject.services.notificaciones.repository;

import com.fitproject.services.notificaciones.model.Notificacion;

import java.util.List;
import java.util.Optional;

public interface NotificacionRepository {
    Notificacion save(Notificacion notificacion);
    List<Notificacion> findAll();
    Optional<Notificacion> findById(Long id);
}
