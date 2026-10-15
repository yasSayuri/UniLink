package br.com.unilink.backend.dto;

import java.time.Instant;

public record FollowRequestResponse(
        String id,
        String requesterId,
        String username,
        String name,
        String avatarUrl,
        Integer avatarPositionX,
        Integer avatarPositionY,
        Instant createdAt) {
}
