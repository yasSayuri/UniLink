package br.com.unilink.backend.dto;

public record CommunityJoinRequestResponse(
        String communityId,
        String communityName,
        String requesterId,
        String requesterName,
        String requesterUsername,
        String requesterAvatarUrl) {
}
