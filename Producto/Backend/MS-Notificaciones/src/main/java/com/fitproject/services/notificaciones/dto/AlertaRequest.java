package com.fitproject.services.notificaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertaRequest {
    private String correoSupervisor;
    private String nombreHito;
}
