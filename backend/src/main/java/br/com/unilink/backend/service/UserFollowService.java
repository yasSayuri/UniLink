package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.FollowUserResponse;
import br.com.unilink.backend.model.UserFollow;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class UserFollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final UserBlockService userBlockService;

    @Autowired
    public UserFollowService(
            UserFollowRepository followRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            UserBlockService userBlockService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.userBlockService = userBlockService;
    }

    public UserFollowService(
            UserFollowRepository followRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this(followRepository, userRepository, notificationService, null);
    }

    public void follow(String followerId, String followedId) {
        if (followerId.equals(followedId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode seguir a si mesmo.");
        }
        if (userBlockService != null && userBlockService.isBlockedEither(followerId, followedId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Usuários bloqueados não podem seguir uns aos outros.");
        }
        var follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        var followed = userRepository.findById(followedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (!followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
            followRepository.save(new UserFollow(followerId, followedId));
            notificationService.notifyUserFollowed(follower, followed);
        }
    }

    public void unfollow(String followerId, String followedId) {
        followRepository.deleteByFollowerIdAndFollowedId(followerId, followedId);
    }

    public List<FollowUserResponse> following(String userId) {
        return following(userId, userId);
    }

    public List<FollowUserResponse> following(String userId, String viewerId) {
        return followRepository.findAllByFollowerId(userId).stream()
                .map(UserFollow::getFollowedId)
                .filter(id -> userBlockService == null || !userBlockService.isBlockedEither(viewerId, id))
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Um usuário seguido não foi encontrado.")))
                .map(user -> toResponse(
                        user,
                        userId.equals(viewerId)
                                || followRepository.existsByFollowerIdAndFollowedId(viewerId, user.getId())))
                .toList();
    }

    public List<FollowUserResponse> followers(String userId) {
        return followers(userId, userId);
    }

    public List<FollowUserResponse> followers(String userId, String viewerId) {
        return followRepository.findAllByFollowedId(userId).stream()
                .map(UserFollow::getFollowerId)
                .filter(id -> userBlockService == null || !userBlockService.isBlockedEither(viewerId, id))
                .map(id -> userRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Um seguidor não foi encontrado.")))
                .map(user -> toResponse(
                        user,
                        followRepository.existsByFollowerIdAndFollowedId(viewerId, user.getId())))
                .toList();
    }

    public long followingCount(String userId) {
        return followRepository.countByFollowerId(userId);
    }

    public long followersCount(String userId) {
        return followRepository.countByFollowedId(userId);
    }

    public boolean isFollowing(String followerId, String followedId) {
        return followRepository.existsByFollowerIdAndFollowedId(followerId, followedId);
    }

    private FollowUserResponse toResponse(br.com.unilink.backend.model.User user, boolean following) {
        return new FollowUserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getCourse(),
                user.getCampus(),
                user.getAvatarUrl(),
                user.getAvatarPositionX(),
                user.getAvatarPositionY(),
                following);
    }
}
