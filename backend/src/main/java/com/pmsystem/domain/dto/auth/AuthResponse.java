package com.pmsystem.domain.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType) {
}
