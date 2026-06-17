package com.fitproject.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsumoRequest {
    @NotNull @Min(1)
    private Integer cantidad;
    private String referencia;    // evidenceId
    private String realizadoPor;  // workerId
}
