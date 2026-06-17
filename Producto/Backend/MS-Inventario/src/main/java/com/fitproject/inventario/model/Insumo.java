package com.fitproject.inventario.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "insumos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Insumo {

    @Id
    @Column(name = "insumo_id", nullable = false, unique = true)
    private String insumoId;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "cantidad_disponible", nullable = false)
    @Builder.Default
    private Integer cantidadDisponible = 0;

    @Column(name = "unidad_medida", nullable = false)
    private String unidadMedida;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (insumoId == null) insumoId = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
