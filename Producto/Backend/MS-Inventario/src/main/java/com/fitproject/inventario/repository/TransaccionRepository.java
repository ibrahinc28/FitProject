package com.fitproject.inventario.repository;

import com.fitproject.inventario.model.TransaccionInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<TransaccionInventario, String> {
    List<TransaccionInventario> findByInsumo_InsumoIdOrderByCreatedAtDesc(String insumoId);
}
