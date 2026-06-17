package com.fitproject.inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateInsumoRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    private String descripcion;
    @NotNull @Min(0)
    private Integer cantidadDisponible;
    @NotBlank(message = "La unidad de medida es obligatoria")
    private String unidadMedida;
}
