package br.com.unilink.backend.dto;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String type,
        String message,
        String actorId,
        String actorName,
        String actorAvatarUrl,
        String postId,
        String communityId,
        String communityName,
        String targetPath,
        boolean read,
        Instant createdAt) {
}
