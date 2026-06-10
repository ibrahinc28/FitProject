package com.fitproject.users.service;

import com.fitproject.users.dto.*;
import com.fitproject.users.model.User;
import com.fitproject.users.model.UserRole;
import com.fitproject.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));
        if (!user.getActive()) throw new IllegalArgumentException("Usuario inactivo");
        if (!passwordEncoder.matches(password, user.getPasswordHash()))
            throw new IllegalArgumentException("Credenciales inválidas");
        return AuthResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .active(user.getActive())
                .build();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));
        return toDTO(user);
    }

    public UserDTO createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El email ya está registrado: " + req.getEmail());
        UserRole role = UserRole.valueOf(req.getRole().toUpperCase());
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .role(role)
                .active(true)
                .build();
        return toDTO(userRepository.save(user));
    }

    public UserDTO updateUserRole(String userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));
        user.setRole(UserRole.valueOf(role.toUpperCase()));
        return toDTO(userRepository.save(user));
    }

    public UserDTO toggleUserActive(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));
        user.setActive(!user.getActive());
        return toDTO(userRepository.save(user));
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
