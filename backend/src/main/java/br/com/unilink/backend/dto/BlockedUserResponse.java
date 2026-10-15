package br.com.unilink.backend.dto;

public record BlockedUserResponse(
        String id,
        String username,
        String name,
        String avatarUrl) {
}
