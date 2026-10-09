package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.FollowUserResponse;
import br.com.unilink.backend.model.UserFollow;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserFollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserFollowService(
            UserFollowRepository followRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void follow(String followerId, String followedId) {
        if (followerId.equals(followedId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode seguir a si mesmo.");
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
                following);
    }
}
