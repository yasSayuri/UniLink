package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.BlockedUserResponse;
import br.com.unilink.backend.dto.FollowRequestResponse;
import br.com.unilink.backend.dto.SettingsResponse;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.NotificationRepository;
import br.com.unilink.backend.repository.PostRepository;
import br.com.unilink.backend.repository.UserBlockRepository;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.Locale;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SettingsService {

    private final UserRepository userRepository;
    private final UserBlockRepository blockRepository;
    private final UserFollowRepository followRepository;
    private final PostRepository postRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserFollowRequestService followRequestService;

    @Autowired
    public SettingsService(
            UserRepository userRepository,
            UserBlockRepository blockRepository,
            UserFollowRepository followRepository,
            PostRepository postRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            UserFollowRequestService followRequestService) {
        this.userRepository = userRepository;
        this.blockRepository = blockRepository;
        this.followRepository = followRepository;
        this.postRepository = postRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.followRequestService = followRequestService;
    }

    public SettingsService(
            UserRepository userRepository,
            UserBlockRepository blockRepository,
            UserFollowRepository followRepository,
            PostRepository postRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        this(userRepository, blockRepository, followRepository, postRepository,
                notificationRepository, passwordEncoder, null);
    }

    public SettingsResponse get(String userId) {
        User user = findUser(userId);
        List<BlockedUserResponse> blockedPeople = blockRepository.findAllByBlockerId(userId).stream()
                .map(block -> userRepository.findById(block.getBlockedId())
                        .map(blocked -> new BlockedUserResponse(
                                blocked.getId(), blocked.getUsername(), blocked.getName(), blocked.getAvatarUrl()))
                        .orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
        List<FollowRequestResponse> followRequests = followRequestService == null
                ? List.of()
                : followRequestService.pendingFor(userId);
        return new SettingsResponse(user.isPrivateAccount(), user.isDarkMode(), blockedPeople, user.getBlockedWords(), followRequests);
    }

    public void changeEmail(String userId, String currentEmail, String newEmail, String confirmation) {
        User user = findUser(userId);
        String current = currentEmail.trim().toLowerCase(Locale.ROOT);
        String next = newEmail.trim().toLowerCase(Locale.ROOT);
        if (!user.getEmail().equals(current)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O e-mail atual não confere.");
        }
        if (!next.equals(confirmation.trim().toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A confirmação do e-mail não confere.");
        }
        if (userRepository.existsByEmail(next) && !next.equals(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse e-mail já foi cadastrado.");
        }
        user.changeEmail(next);
        userRepository.save(user);
    }

    public void changePassword(String userId, String newPassword, String confirmation) {
        if (!newPassword.equals(confirmation)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A confirmação da senha não confere.");
        }
        User user = findUser(userId);
        user.changePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void updatePreferences(String userId, Boolean privateAccount, Boolean darkMode) {
        User user = findUser(userId);
        if (privateAccount != null) {
            user.setPrivateAccount(privateAccount);
        }
        if (darkMode != null) {
            user.setDarkMode(darkMode);
        }
        userRepository.save(user);
        if (Boolean.FALSE.equals(privateAccount) && followRequestService != null) {
            followRequestService.deleteIncomingFor(userId);
        }
    }

    public void addBlockedWord(String userId, String word) {
        User user = findUser(userId);
        String normalized = word.trim().toLowerCase(Locale.ROOT);
        user.addBlockedWord(normalized);
        userRepository.save(user);
    }

    public void removeBlockedWord(String userId, String word) {
        User user = findUser(userId);
        user.removeBlockedWord(word.trim().toLowerCase(Locale.ROOT));
        userRepository.save(user);
    }

    public void unblock(String userId, String blockedId) {
        blockRepository.deleteByBlockerIdAndBlockedId(userId, blockedId);
    }

    public void deleteAccount(String userId) {
        findUser(userId);
        postRepository.deleteByAuthorId(userId);
        notificationRepository.deleteByUserId(userId);
        followRepository.deleteByFollowerId(userId);
        followRepository.deleteByFollowedId(userId);
        if (followRequestService != null) {
            followRequestService.deleteForUser(userId);
        }
        blockRepository.deleteByBlockerId(userId);
        blockRepository.deleteByBlockedId(userId);
        userRepository.deleteById(userId);
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
}
