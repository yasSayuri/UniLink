package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.CommunityResponse;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.repository.CommunityRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

@Service
public class CommunityCatalogService {

    private final CommunityRepository communityRepository;

    public CommunityCatalogService(CommunityRepository communityRepository) {
        this.communityRepository = communityRepository;
    }

    public List<CommunityResponse> list(String userId) {
        return communityRepository.findAllByOrderByNameAsc().stream()
                .map(community -> toResponse(community, userId))
                .toList();
    }

    public CommunityResponse joinOrRequest(String communityId, String userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
        if ("PRIVATE".equals(community.getVisibility())) {
            community.requestMembership(userId);
        } else {
            community.addMember(userId);
        }
        return toResponse(communityRepository.save(community), userId);
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
