package com.fitproject.inventario.controller;

import com.fitproject.inventario.dto.*;
import com.fitproject.inventario.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/insumos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InsumoController {

    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<List<InsumoDTO>> getAll() {
        return ResponseEntity.ok(inventarioService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsumoDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(inventarioService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InsumoDTO> create(@Valid @RequestBody CreateInsumoRequest req) {
        log.info("POST /api/v1/insumos nombre={}", req.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.create(req));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<InsumoDTO> addStock(@PathVariable String id,
                                               @Valid @RequestBody UpdateStockRequest req) {
        log.info("PATCH /api/v1/insumos/{}/stock cantidad={}", id, req.getCantidad());
        return ResponseEntity.ok(inventarioService.addStock(id, req));
    }

    /** Internal endpoint — called by MS-Gestion when worker submits evidence with insumos. */
    @PostMapping("/{id}/consumir")
    public ResponseEntity<InsumoDTO> consumir(@PathVariable String id,
                                               @Valid @RequestBody ConsumoRequest req) {
        log.info("POST /api/v1/insumos/{}/consumir cantidad={} ref={}", id, req.getCantidad(), req.getReferencia());
        return ResponseEntity.ok(inventarioService.consumir(id, req));
    }

    @GetMapping("/{id}/transacciones")
    public ResponseEntity<List<TransaccionDTO>> getTransacciones(@PathVariable String id) {
        return ResponseEntity.ok(inventarioService.getTransacciones(id));
    }
}
