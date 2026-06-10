package com.fitproject.services.notificaciones.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    private Long id;
    private String correoDestinatario;
    private String mensaje;
    private String tipoAlerta;
    private String estado;
}
