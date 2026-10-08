package br.com.unilink.backend.service;

import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.repository.CommunityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class CommunityCatalogServiceTest {

    @Mock
    private CommunityRepository communityRepository;

    @InjectMocks
    private CommunityCatalogService communityCatalogService;

    @Test
    void createsDefaultCommunities() {
        lenient().when(communityRepository.findByName(anyString())).thenReturn(java.util.Optional.empty());

        communityCatalogService.ensureDefaultCommunities();

        verify(communityRepository, org.mockito.Mockito.times(5)).save(any());
    }

    @Test
    void updatesMetadataOnExistingCommunitiesWithoutReplacingTheirMembers() {
        Community existing = new Community("Grupo de Estudos", "old", "old", "old", "old", "PUBLIC");
        when(communityRepository.findByName(anyString())).thenReturn(java.util.Optional.of(existing));

        communityCatalogService.ensureDefaultCommunities();

        verify(communityRepository, org.mockito.Mockito.times(5)).save(any());
        verify(communityRepository, org.mockito.Mockito.times(5)).save(eq(existing));
    }
}
