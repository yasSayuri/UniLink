package br.com.unilink.backend.dto;

import java.time.Instant;

public record PostCommentResponse(
        String id,
        String authorId,
        String authorName,
        String authorUsername,
        String authorAvatarUrl,
        String content,
        Instant createdAt) {
}
