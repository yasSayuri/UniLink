package br.com.unilink.backend.dto;

public record FollowUserResponse(
        String id,
        String username,
        String name,
        String course,
        String campus,
        boolean following) {
}
