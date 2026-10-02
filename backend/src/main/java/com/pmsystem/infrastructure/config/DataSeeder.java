package com.pmsystem.infrastructure.config;

import com.pmsystem.domain.model.Role;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String ROOT_EMAIL    = "admin@gmail.com";
    private static final String ROOT_USERNAME = "root_admin";
    private static final String ROOT_PASSWORD = "admin";

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(ROOT_EMAIL)) {
            UserEntity root = UserEntity.builder()
                    .email(ROOT_EMAIL)
                    .username(ROOT_USERNAME)
                    .passwordHash(passwordEncoder.encode(ROOT_PASSWORD))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(root);
            log.info("Root admin account created: {}", ROOT_EMAIL);
        } else {
            log.debug("Root admin account already exists, skipping seed.");
        }
    }
}
