package com.fitproject.inventario.repository;

import com.fitproject.inventario.model.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsumoRepository extends JpaRepository<Insumo, String> {
}
