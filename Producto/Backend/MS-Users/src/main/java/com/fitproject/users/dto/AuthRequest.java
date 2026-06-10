package com.fitproject.users.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    @NotBlank(message = "El email es requerido")
    private String email;
    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
