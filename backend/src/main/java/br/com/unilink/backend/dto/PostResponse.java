package br.com.unilink.backend.dto;

import java.time.Instant;
import java.util.List;
import br.com.unilink.backend.model.PostMedia;

public record PostResponse(
        String id,
        String authorId,
        String authorName,
        String authorUsername,
        String institutionName,
        String campus,
        String content,
        String privacy,
        String communityName,
        List<PostMedia> media,
        List<String> hashtags,
        Instant createdAt,
        long likes,
        boolean likedByCurrentUser,
        List<PostCommentResponse> comments,
        long reposts,
        boolean repostedByCurrentUser,
        boolean reposted) {
}
