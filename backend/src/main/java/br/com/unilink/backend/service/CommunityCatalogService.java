package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.CommunityResponse;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.repository.CommunityRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

@Service
@Order(1)
public class CommunityCatalogService implements ApplicationRunner {

    private static final String CAMPUS = "Campo Mourão";

    private final CommunityRepository communityRepository;

    public CommunityCatalogService(CommunityRepository communityRepository) {
        this.communityRepository = communityRepository;
    }

    public void ensureDefaultCommunities() {
        List<CommunitySeed> defaults = List.of(
                new CommunitySeed("Engenharia de Computação", "Projetos, disciplinas e oportunidades do curso.", "Acadêmica",
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85", "PUBLIC"),
                new CommunitySeed("Vida Universitária UTFPR", "Avisos e conversas sobre a rotina universitária.", "Universidade",
                        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85", "PUBLIC"),
                new CommunitySeed("Moradia e Repúblicas", "Indicações e oportunidades de moradia estudantil.", "Moradia",
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85", "PRIVATE"),
                new CommunitySeed("Compra, venda e troca", "Materiais, livros e itens para estudantes.", "Classificados",
                        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85", "PUBLIC"),
                new CommunitySeed("Grupo de Estudos", "Encontre colegas para estudar e compartilhar materiais.", "Estudos",
                        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85", "PRIVATE"));

        for (CommunitySeed seed : defaults) {
            Community community = communityRepository.findByName(seed.name())
                    .orElseGet(() -> new Community(
                            seed.name(),
                            seed.description(),
                            seed.category(),
                            CAMPUS,
                            seed.imageUrl(),
                            seed.visibility()));
            community.updateDiscoveryDetails(
                    seed.description(), seed.category(), CAMPUS, seed.imageUrl(), seed.visibility());
            communityRepository.save(community);
        }
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureDefaultCommunities();
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

    private record CommunitySeed(
            String name,
            String description,
            String category,
            String imageUrl,
            String visibility) {
    }
}
