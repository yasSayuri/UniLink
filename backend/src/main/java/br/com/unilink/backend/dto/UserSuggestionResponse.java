package br.com.unilink.backend.dto;

public record UserSuggestionResponse(
        String id,
        String username,
        String name,
        String avatarUrl,
        String course,
        String campus,
        boolean following,
        boolean demoAccount) {
}
