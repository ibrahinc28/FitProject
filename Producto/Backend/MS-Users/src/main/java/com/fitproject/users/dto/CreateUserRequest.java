package com.fitproject.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
    @NotBlank
    private String fullName;
    @NotBlank
    private String role;
    private String specialty;
}
