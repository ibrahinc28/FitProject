package com.fitproject.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateStockRequest {
    @NotNull @Min(1)
    private Integer cantidad;  // amount to ADD to current stock
    private String realizadoPor;
}
