package com.fitproject.inventario.service;

import com.fitproject.inventario.dto.*;
import com.fitproject.inventario.model.*;
import com.fitproject.inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InsumoRepository insumoRepository;
    private final TransaccionRepository transaccionRepository;

    @Transactional(readOnly = true)
    public List<InsumoDTO> getAll() {
        return insumoRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InsumoDTO getById(String id) {
        return toDTO(findById(id));
    }

    @Transactional
    public InsumoDTO create(CreateInsumoRequest req) {
        Insumo insumo = insumoRepository.save(Insumo.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .cantidadDisponible(req.getCantidadDisponible())
                .unidadMedida(req.getUnidadMedida())
                .build());
        if (req.getCantidadDisponible() > 0) {
            registrarTransaccion(insumo, TipoTransaccion.ENTRADA, req.getCantidadDisponible(),
                    "stock-inicial", "admin");
        }
        return toDTO(insumo);
    }

    @Transactional
    public InsumoDTO addStock(String id, UpdateStockRequest req) {
        Insumo insumo = findById(id);
        insumo.setCantidadDisponible(insumo.getCantidadDisponible() + req.getCantidad());
        insumoRepository.save(insumo);
        registrarTransaccion(insumo, TipoTransaccion.ENTRADA, req.getCantidad(),
                "ajuste-admin", req.getRealizadoPor());
        return toDTO(insumo);
    }

    /**
     * Called by MS-Gestion when a worker submits evidence.
     * Returns updated InsumoDTO after deducting stock.
     * Throws IllegalStateException if stock is insufficient — MS-Gestion catches it and returns 409.
     */
    @Transactional
    public InsumoDTO consumir(String id, ConsumoRequest req) {
        Insumo insumo = findById(id);
        if (insumo.getCantidadDisponible() < req.getCantidad()) {
            throw new IllegalStateException(
                "Stock insuficiente para '" + insumo.getNombre() + "'. " +
                "Disponible: " + insumo.getCantidadDisponible() + " " + insumo.getUnidadMedida() +
                ", solicitado: " + req.getCantidad() + " " + insumo.getUnidadMedida() + "."
            );
        }
        insumo.setCantidadDisponible(insumo.getCantidadDisponible() - req.getCantidad());
        insumoRepository.save(insumo);
        registrarTransaccion(insumo, TipoTransaccion.SALIDA, req.getCantidad(),
                req.getReferencia(), req.getRealizadoPor());
        return toDTO(insumo);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDTO> getTransacciones(String insumoId) {
        return transaccionRepository.findByInsumo_InsumoIdOrderByCreatedAtDesc(insumoId)
                .stream().map(this::toTransaccionDTO).collect(Collectors.toList());
    }

    private void registrarTransaccion(Insumo insumo, TipoTransaccion tipo,
                                       int cantidad, String referencia, String realizadoPor) {
        transaccionRepository.save(TransaccionInventario.builder()
                .insumo(insumo)
                .tipo(tipo)
                .cantidad(cantidad)
                .stockResultante(insumo.getCantidadDisponible())
                .referencia(referencia)
                .realizadoPor(realizadoPor)
                .build());
    }

    private Insumo findById(String id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Insumo no encontrado: " + id));
    }

    private InsumoDTO toDTO(Insumo i) {
        return InsumoDTO.builder()
                .insumoId(i.getInsumoId())
                .nombre(i.getNombre())
                .descripcion(i.getDescripcion())
                .cantidadDisponible(i.getCantidadDisponible())
                .unidadMedida(i.getUnidadMedida())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .build();
    }

    private TransaccionDTO toTransaccionDTO(TransaccionInventario t) {
        return TransaccionDTO.builder()
                .transaccionId(t.getTransaccionId())
                .insumoId(t.getInsumo().getInsumoId())
                .insumoNombre(t.getInsumo().getNombre())
                .tipo(t.getTipo().name())
                .cantidad(t.getCantidad())
                .stockResultante(t.getStockResultante())
                .referencia(t.getReferencia())
                .realizadoPor(t.getRealizadoPor())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
