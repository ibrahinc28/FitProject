package com.fitproject.bffusuarios.client;

import com.fitproject.bffusuarios.dto.AuthResponseMs;
import com.fitproject.bffusuarios.dto.LoginRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "ms-users", url = "${ms.users.url}")
public interface UsersClient {

    @PostMapping("/api/v1/users/authenticate")
    AuthResponseMs authenticate(@RequestBody LoginRequest request);
}
