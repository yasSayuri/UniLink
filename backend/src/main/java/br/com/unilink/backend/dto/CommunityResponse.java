package br.com.unilink.backend.dto;

public record CommunityResponse(
        String id,
        String name,
        String description,
        String category,
        String campus,
        String imageUrl,
        String visibility,
        long memberCount,
        boolean member,
        boolean requestPending) {
}
