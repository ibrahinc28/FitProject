package com.fitproject.users.controller;

import com.fitproject.users.dto.*;
import com.fitproject.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/authenticate")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request.getEmail(), request.getPassword()));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserDTO> updateRole(
            @PathVariable String userId,
            @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(userId, role));
    }

    @PatchMapping("/{userId}/toggle")
    public ResponseEntity<UserDTO> toggleActive(@PathVariable String userId) {
        return ResponseEntity.ok(userService.toggleUserActive(userId));
    }
}
