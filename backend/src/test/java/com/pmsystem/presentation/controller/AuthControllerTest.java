package com.pmsystem.presentation.controller;

import com.pmsystem.application.service.AuthService;
import com.pmsystem.domain.dto.auth.AuthResponse;
import com.pmsystem.domain.dto.auth.LoginRequest;
import com.pmsystem.domain.dto.auth.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ReturnsAuthResponse() {
        RegisterRequest req = new RegisterRequest("user", "mail", "pass", "First", "Last", "USER");
        AuthResponse res = new AuthResponse("token", "refresh", "Bearer");
        when(authService.register(any())).thenReturn(res);

        ResponseEntity<AuthResponse> response = authController.register(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(res);
    }

    @Test
    void login_ReturnsAuthResponse() {
        LoginRequest req = new LoginRequest("user", "pass");
        AuthResponse res = new AuthResponse("token", "refresh", "Bearer");
        when(authService.login(any())).thenReturn(res);

        ResponseEntity<AuthResponse> response = authController.authenticate(req);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(res);
    }

    @Test
    void refresh_ReturnsAuthResponse() {
        AuthResponse res = new AuthResponse("token", "refresh", "Bearer");
        when(authService.refreshToken("oldToken")).thenReturn(res);

        ResponseEntity<AuthResponse> response = authController.refreshToken("oldToken");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(res);
    }
}
