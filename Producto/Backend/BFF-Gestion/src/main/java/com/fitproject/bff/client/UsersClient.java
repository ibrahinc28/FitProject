package com.fitproject.bff.client;

import com.fitproject.bff.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "ms-users", url = "${services.ms-users.url:http://localhost:8090/api/v1}")
public interface UsersClient {

    @PostMapping("/users/authenticate")
    AuthResponse authenticateUser(@RequestBody AuthRequest request);

    @GetMapping("/users")
    List<UserDTO> getAllUsers();

    @PostMapping("/users")
    UserDTO createUser(@RequestBody CreateUserRequest request);

    @PatchMapping("/users/{userId}/role")
    UserDTO updateUserRole(@PathVariable("userId") String userId,
                           @RequestParam("role") String role);

    @PatchMapping("/users/{userId}/toggle")
    UserDTO toggleUserActive(@PathVariable("userId") String userId);
}
