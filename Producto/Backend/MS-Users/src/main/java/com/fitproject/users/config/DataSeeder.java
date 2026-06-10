package com.fitproject.users.config;

import com.fitproject.users.model.User;
import com.fitproject.users.model.UserRole;
import com.fitproject.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seed("admin@fitproject.com",    "Admin123!",   "Administrador",      UserRole.ADMIN);
        seed("supervisor@fitproject.com","Super123!",  "Supervisor Demo",    UserRole.SUPERVISOR_OBRA);
        seed("inversor@fitproject.com", "Invest123!",  "Inversionista Demo", UserRole.INVERSIONISTA);
        seed("vendedor@fitproject.com", "Vende123!",   "Vendedor Demo",      UserRole.VENDEDOR);
    }

    private void seed(String email, String password, String name, UserRole role) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .fullName(name)
                    .role(role)
                    .active(true)
                    .build());
            log.info(">>> Usuario creado: {} [{}]", email, role);
        }
    }
}
