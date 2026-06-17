package com.fitproject.inventario.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transacciones_inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransaccionInventario {

    @Id
    @Column(name = "transaccion_id", nullable = false, unique = true)
    private String transaccionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoTransaccion tipo;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    // Stock snapshot after this transaction
    @Column(name = "stock_resultante", nullable = false)
    private Integer stockResultante;

    @Column(name = "referencia")
    private String referencia;  // evidenceId or "admin-adjustment"

    @Column(name = "realizado_por")
    private String realizadoPor;  // workerId or adminId

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (transaccionId == null) transaccionId = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
    }
}
