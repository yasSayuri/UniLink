package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.CreateCommunityRequest;
import br.com.unilink.backend.model.Community;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.CommunityRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommunityCatalogServiceTest {

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CommunityCatalogService communityCatalogService;

    @Test
    void rejectsDuplicatedCommunityNameIgnoringCase() {
        when(communityRepository.existsByNameIgnoreCase("Grupo de Estudo")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> communityCatalogService.create(
                        new CreateCommunityRequest(
                                "Grupo de Estudo",
                                "Descrição",
                                "Estudo",
                                "PUBLIC",
                                null),
                        "user-1"));

        assertEquals("Já existe um grupo com esse nome.", exception.getReason());
    }

    @Test
    void createsCommunityAndAddsCreatorAsMember() {
        when(communityRepository.existsByNameIgnoreCase("Grupo de IA")).thenReturn(false);
        User creator = new User("creator", "Creator User", "creator@example.com", "hash");
        creator.completeOnboarding("UTFPR", "utfpr.edu.br", "Campus Centro", "Sistemas", 5);
        when(userRepository.findById("user-1")).thenReturn(Optional.of(creator));
        when(communityRepository.save(any(Community.class))).thenAnswer((invocation) -> invocation.getArgument(0));

        communityCatalogService.create(
                new CreateCommunityRequest(
                        "Grupo de IA",
                        "Estudo sobre inteligência artificial.",
                        "Estudo",
                        "PRIVATE",
                        "data:image/png;base64,abc"),
                "user-1");

        ArgumentCaptor<Community> savedCommunity = ArgumentCaptor.forClass(Community.class);
        verify(communityRepository).save(savedCommunity.capture());
        assertEquals("Grupo de IA", savedCommunity.getValue().getName());
        assertEquals("Campus Centro", savedCommunity.getValue().getCampus());
        assertEquals("PRIVATE", savedCommunity.getValue().getVisibility());
        assertEquals(1, savedCommunity.getValue().getMemberIds().size());
        assertEquals("user-1", savedCommunity.getValue().getMemberIds().get(0));
    }
}
