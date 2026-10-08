package br.com.unilink.backend.dto;

public record AuthResponse(String token, String tokenType, UserResponse user) {
}
