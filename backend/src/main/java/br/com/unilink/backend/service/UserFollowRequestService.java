package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.FollowRequestResponse;
import br.com.unilink.backend.model.UserFollow;
import br.com.unilink.backend.model.UserFollowRequest;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserFollowRequestRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserFollowRequestService {

    private final UserFollowRequestRepository requestRepository;
    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;

    public UserFollowRequestService(
            UserFollowRequestRepository requestRepository,
            UserFollowRepository followRepository,
            UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public List<FollowRequestResponse> pendingFor(String targetId) {
        return requestRepository.findAllByTargetIdOrderByCreatedAtAsc(targetId).stream()
                .flatMap(request -> userRepository.findById(request.getRequesterId())
                        .map(user -> toResponse(request, user))
                        .stream())
                .toList();
    }

    public void accept(String targetId, String requesterId) {
        UserFollowRequest request = findRequest(targetId, requesterId);
        findUser(requesterId);
        findUser(targetId);
        if (!followRepository.existsByFollowerIdAndFollowedId(requesterId, targetId)) {
            followRepository.save(new UserFollow(requesterId, targetId));
        }
        requestRepository.delete(request);
    }

    public void reject(String targetId, String requesterId) {
        UserFollowRequest request = findRequest(targetId, requesterId);
        requestRepository.delete(request);
    }

    public void deleteForUser(String userId) {
        requestRepository.deleteByRequesterId(userId);
        requestRepository.deleteByTargetId(userId);
    }

    public void deleteIncomingFor(String targetId) {
        requestRepository.deleteByTargetId(targetId);
    }

    private UserFollowRequest findRequest(String targetId, String requesterId) {
        UserFollowRequest request = requestRepository.findByRequesterIdAndTargetId(requesterId, targetId);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitação de seguimento não encontrada.");
        }
        return request;
    }

    private User findUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    private FollowRequestResponse toResponse(UserFollowRequest request, User requester) {
        return new FollowRequestResponse(
                request.getId(),
                requester.getId(),
                requester.getUsername(),
                requester.getName(),
                requester.getAvatarUrl(),
                requester.getAvatarPositionX(),
                requester.getAvatarPositionY(),
                request.getCreatedAt());
    }
}
