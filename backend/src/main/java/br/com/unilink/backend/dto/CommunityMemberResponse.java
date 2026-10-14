package br.com.unilink.backend.dto;

public record CommunityMemberResponse(
        String id,
        String username,
        String name,
        String course,
        String campus,
        String avatarUrl,
        Integer avatarPositionX,
        Integer avatarPositionY) {
}
