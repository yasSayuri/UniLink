package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.OnboardingRequest;
import br.com.unilink.backend.dto.UpdateProfileRequest;
import br.com.unilink.backend.dto.UserResponse;
import br.com.unilink.backend.dto.PublicUserResponse;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final UserFollowService userFollowService;
    private final UserBlockService userBlockService;

    @Autowired
    public OnboardingService(
            UserRepository userRepository,
            UserFollowService userFollowService,
            UserBlockService userBlockService) {
        this.userRepository = userRepository;
        this.userFollowService = userFollowService;
        this.userBlockService = userBlockService;
    }

    public OnboardingService(UserRepository userRepository, UserFollowService userFollowService) {
        this(userRepository, userFollowService, null);
    }

    public UserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return toResponse(user);
    }

    public PublicUserResponse getPublicUser(String profileId, String viewerId) {
        User user = userRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        boolean following = !profileId.equals(viewerId) && userFollowService.isFollowing(viewerId, profileId);
        return new PublicUserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getInstitutionName(),
                user.getCampus(),
                user.getCourse(),
                user.getAcademicPeriod(),
                user.isOnboardingCompleted(),
                userFollowService.followersCount(profileId),
                userFollowService.followingCount(profileId),
                following,
                userBlockService != null && userBlockService.isBlocked(viewerId, profileId),
                userBlockService != null && userBlockService.isBlocked(profileId, viewerId),
                user.getAvatarUrl(),
                user.getHeaderUrl(),
                user.getAvatarPositionX(),
                user.getAvatarPositionY(),
                user.getHeaderPositionX(),
                user.getHeaderPositionY(),
                user.isPrivateAccount(),
                !following && !profileId.equals(viewerId)
                        && userFollowService.hasPendingRequest(viewerId, profileId));
    }

    public UserResponse complete(String userId, OnboardingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        user.completeOnboarding(
                request.institutionName().trim(),
                normalizeDomain(request.institutionDomain()),
                request.campus().trim(),
                request.course().trim(),
                request.academicPeriod());
        return toResponse(userRepository.save(user));
    }

    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        String username = request.username().trim().toLowerCase(java.util.Locale.ROOT);
        if (userRepository.existsByUsernameAndIdNot(username, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse usuário já existe.");
        }
        user.updateProfile(
                request.name().trim(),
                username,
                request.avatarUrl(),
                request.headerUrl(),
                request.avatarPositionX(),
                request.avatarPositionY(),
                request.headerPositionX(),
                request.headerPositionY());
        return toResponse(userRepository.save(user));
    }

    private String normalizeDomain(String domain) {
        return domain == null ? "" : domain.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getInstitutionName(),
                user.getInstitutionDomain(),
                user.getCampus(),
                user.getCourse(),
                user.getAcademicPeriod(),
                user.isOnboardingCompleted(),
                userFollowService.followersCount(user.getId()),
                userFollowService.followingCount(user.getId()),
                user.getAvatarUrl(),
                user.getHeaderUrl(),
                user.getAvatarPositionX(),
                user.getAvatarPositionY(),
                user.getHeaderPositionX(),
                user.getHeaderPositionY(),
                user.isPrivateAccount());
    }
}
