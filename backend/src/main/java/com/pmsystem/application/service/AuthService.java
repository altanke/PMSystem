package com.pmsystem.application.service;

import com.pmsystem.domain.dto.auth.AuthResponse;
import com.pmsystem.domain.dto.auth.LoginRequest;
import com.pmsystem.domain.dto.auth.RegisterRequest;
import com.pmsystem.domain.model.Role;
import com.pmsystem.infrastructure.persistence.entity.UserEntity;
import com.pmsystem.infrastructure.persistence.repository.UserRepository;
import com.pmsystem.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (repository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already in use");
        }

        Role userRole = request.role() != null ? Role.valueOf(request.role().toUpperCase()) : Role.USER;

        UserEntity user = UserEntity.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(userRole)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(jwtToken, refreshToken, "Bearer ");
    }

    public AuthResponse login(LoginRequest request) {

        UserEntity user = repository.findByEmailOrUsername(request.login(), request.login())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        request.password()));

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(jwtToken, refreshToken, "Bearer ");
    }

    public AuthResponse refreshToken(String refreshToken) {
        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            UserEntity user = repository.findByEmail(userEmail).orElseThrow();

            if (jwtService.isTokenValid(refreshToken, user)) {
                String accessToken = jwtService.generateToken(user);
                return new AuthResponse(accessToken, refreshToken, "Bearer ");
            }
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }
}
