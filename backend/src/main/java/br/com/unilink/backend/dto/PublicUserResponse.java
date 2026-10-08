package br.com.unilink.backend.dto;

public record PublicUserResponse(
        String id,
        String username,
        String name,
        String institutionName,
        String campus,
        String course,
        Integer academicPeriod,
        boolean onboardingCompleted,
        long followersCount,
        long followingCount,
        boolean following,
        String avatarUrl,
        String headerUrl,
        Integer avatarPositionX,
        Integer avatarPositionY,
        Integer headerPositionX,
        Integer headerPositionY) {
}
