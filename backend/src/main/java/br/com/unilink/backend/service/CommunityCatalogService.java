package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.CommunityResponse;
import br.com.unilink.backend.dto.CreateCommunityRequest;
import br.com.unilink.backend.dto.CommunityJoinRequestResponse;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.repository.CommunityRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

@Service
public class CommunityCatalogService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommunityCatalogService(
            CommunityRepository communityRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.communityRepository = communityRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<CommunityResponse> list(String userId) {
        return communityRepository.findAllByOrderByNameAsc().stream()
                .map(community -> toResponse(community, userId))
                .toList();
    }

    public CommunityResponse joinOrRequest(String communityId, String userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
        var requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        boolean wasPending = community.getPendingRequestUserIds().contains(userId);
        if ("PRIVATE".equals(community.getVisibility())) {
            community.requestMembership(userId);
        } else {
            community.addMember(userId);
        }
        Community saved = communityRepository.save(community);
        if ("PRIVATE".equals(saved.getVisibility()) && !wasPending && saved.getPendingRequestUserIds().contains(userId)) {
            notificationService.notifyPrivateCommunityJoinRequest(requester, saved);
        }
        return toResponse(saved, userId);
    }

    public CommunityResponse create(CreateCommunityRequest request, String creatorId) {
        String name = request.name().trim();
        if (communityRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um grupo com esse nome.");
        }
        var creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        String campus = creator.getCampus() == null || creator.getCampus().isBlank()
                ? "Campus universitário"
                : creator.getCampus().trim();
        String imageUrl = request.imageUrl() == null || request.imageUrl().isBlank()
                ? "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                : request.imageUrl().trim();
        Community community = new Community(
                name,
                request.description().trim(),
                request.category().trim(),
                campus,
                imageUrl,
                request.visibility(),
                creatorId);
        community.addMember(creatorId);
        return toResponse(communityRepository.save(community), creatorId);
    }

    public List<CommunityJoinRequestResponse> listJoinRequests(String ownerId) {
        return communityRepository.findAllByOwnerIdOrderByNameAsc(ownerId).stream()
                .flatMap(community -> community.getPendingRequestUserIds().stream()
                        .map(requesterId -> userRepository.findById(requesterId)
                                .map(user -> new CommunityJoinRequestResponse(
                                        community.getId(),
                                        community.getName(),
                                        user.getId(),
                                        user.getName(),
                                        user.getUsername(),
                                        user.getAvatarUrl()))
                                .orElse(null)))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public CommunityResponse approveJoinRequest(String communityId, String requesterId, String ownerId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
        if (!community.isOwner(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode aprovar pedidos deste grupo.");
        }
        if (!community.hasPendingRequest(requesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado.");
        }
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        var requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        community.addMember(requesterId);
        Community saved = communityRepository.save(community);
        notificationService.notifyPrivateCommunityRequestApproved(owner, requester, saved);
        return toResponse(saved, ownerId);
    }

    public CommunityResponse rejectJoinRequest(String communityId, String requesterId, String ownerId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
        if (!community.isOwner(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode recusar pedidos deste grupo.");
        }
        if (!community.hasPendingRequest(requesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado.");
        }
        var owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        var requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        community.rejectMembershipRequest(requesterId);
        Community saved = communityRepository.save(community);
        notificationService.notifyPrivateCommunityRequestRejected(owner, requester, saved);
        return toResponse(saved, ownerId);
    }

    private CommunityResponse toResponse(Community community, String userId) {
        return new CommunityResponse(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getCategory(),
                community.getCampus(),
                community.getImageUrl(),
                community.getVisibility(),
                community.getMemberIds().size(),
                community.getMemberIds().contains(userId),
                community.getPendingRequestUserIds().contains(userId));
    }
}
