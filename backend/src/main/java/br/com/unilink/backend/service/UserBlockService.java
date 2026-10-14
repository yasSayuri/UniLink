package br.com.unilink.backend.service;

import br.com.unilink.backend.model.UserBlock;
import br.com.unilink.backend.repository.UserBlockRepository;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserBlockService {

    private final UserBlockRepository blockRepository;
    private final UserRepository userRepository;
    private final UserFollowRepository followRepository;

    public UserBlockService(
            UserBlockRepository blockRepository,
            UserRepository userRepository,
            UserFollowRepository followRepository) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    public void block(String blockerId, String blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode bloquear a si mesmo.");
        }
        if (!userRepository.existsById(blockedId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado.");
        }
        if (!blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            try {
                blockRepository.save(new UserBlock(blockerId, blockedId));
            } catch (DuplicateKeyException exception) {
                // A repeated request is safe and leaves the existing block in place.
            }
        }
        followRepository.deleteByFollowerIdAndFollowedId(blockerId, blockedId);
        followRepository.deleteByFollowerIdAndFollowedId(blockedId, blockerId);
    }

    public void unblock(String blockerId, String blockedId) {
        blockRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    public boolean isBlocked(String blockerId, String blockedId) {
        if (blockerId == null || blockedId == null || blockerId.equals(blockedId)) {
            return false;
        }
        return blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    public boolean isBlockedEither(String firstUserId, String secondUserId) {
        return isBlocked(firstUserId, secondUserId) || isBlocked(secondUserId, firstUserId);
    }
}
