package br.com.unilink.backend.dto;

public record UserResponse(
        String id,
        String username,
        String name,
        String email,
        String institutionName,
        String institutionDomain,
        String campus,
        String course,
        Integer academicPeriod,
        boolean onboardingCompleted,
        long followersCount,
        long followingCount,
        String avatarUrl,
        String headerUrl,
        Integer avatarPositionX,
        Integer avatarPositionY,
        Integer headerPositionX,
        Integer headerPositionY,
        boolean privateAccount) {

    public UserResponse(
            String id, String username, String name, String email,
            String institutionName, String institutionDomain, String campus, String course,
            Integer academicPeriod, boolean onboardingCompleted, long followersCount,
            long followingCount, String avatarUrl, String headerUrl, Integer avatarPositionX,
            Integer avatarPositionY, Integer headerPositionX, Integer headerPositionY) {
        this(id, username, name, email, institutionName, institutionDomain, campus, course,
                academicPeriod, onboardingCompleted, followersCount, followingCount, avatarUrl,
                headerUrl, avatarPositionX, avatarPositionY, headerPositionX, headerPositionY, false);
    }
}
