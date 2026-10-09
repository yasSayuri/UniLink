package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.UserSuggestionResponse;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class UserSearchService {

    private final UserRepository userRepository;
    private final UserFollowRepository followRepository;

    public UserSearchService(UserRepository userRepository, UserFollowRepository followRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    public java.util.List<UserSuggestionResponse> search(String viewerId, String query) {
        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
        if (normalizedQuery.isBlank()) {
            return java.util.List.of();
        }
        return userRepository
                .findTop10ByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(normalizedQuery, normalizedQuery)
                .stream()
                .filter(user -> !viewerId.equals(user.getId()))
                .map(user -> new UserSuggestionResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getName(),
                        user.getAvatarUrl(),
                        user.getCourse(),
                        user.getCampus(),
                        followRepository.existsByFollowerIdAndFollowedId(viewerId, user.getId()),
                        user.isDemoAccount()))
                .toList();
    }

    public java.util.List<UserSuggestionResponse> suggestions(String viewerId) {
        return userRepository.findAllByDemoAccountTrueAndIdNot(viewerId).stream()
                .filter(user -> !followRepository.existsByFollowerIdAndFollowedId(viewerId, user.getId()))
                .limit(3)
                .map(user -> new UserSuggestionResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getName(),
                        user.getAvatarUrl(),
                        user.getCourse(),
                        user.getCampus(),
                        false,
                        true))
                .toList();
    }
}
