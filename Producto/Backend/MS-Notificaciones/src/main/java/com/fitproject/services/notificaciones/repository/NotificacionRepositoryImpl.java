package com.fitproject.services.notificaciones.repository;

import com.fitproject.services.notificaciones.model.Notificacion;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class NotificacionRepositoryImpl implements NotificacionRepository {

    private final ConcurrentHashMap<Long, Notificacion> storage = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @Override
    public Notificacion save(Notificacion notificacion) {
        if (notificacion.getId() == null) {
            notificacion.setId(idGenerator.getAndIncrement());
        }
        storage.put(notificacion.getId(), notificacion);
        return notificacion;
    }

    @Override
    public List<Notificacion> findAll() {
        return storage.values().stream().collect(Collectors.toList());
    }

    @Override
    public Optional<Notificacion> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }
}
