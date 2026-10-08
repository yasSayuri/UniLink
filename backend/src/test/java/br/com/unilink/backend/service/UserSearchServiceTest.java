package br.com.unilink.backend.service;

import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserFollowRepository;
import br.com.unilink.backend.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserSearchServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository followRepository;

    @InjectMocks
    private UserSearchService userSearchService;

    @Test
    void returnsDemoProfilesAsSearchSuggestionsWithoutExposingCredentials() {
        User demoUser = new User("pessoa.fake.ana", "Pessoa Fake - Ana", "ana@example.test", "hash");
        demoUser.markAsDemoAccount();
        demoUser.completeOnboarding("UTFPR", "utfpr.edu.br", "Campo Mourão", "Computação", 2);
        ReflectionTestUtils.setField(demoUser, "id", "demo-id");
        when(userRepository.findTop10ByNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
                "pessoa fake", "pessoa fake")).thenReturn(List.of(demoUser));
        when(followRepository.existsByFollowerIdAndFollowedId("viewer", "demo-id")).thenReturn(false);

        var result = userSearchService.search("viewer", " Pessoa Fake ");

        assertEquals(1, result.size());
        assertEquals("demo-id", result.get(0).id());
        assertEquals(true, result.get(0).demoAccount());
        assertEquals(false, result.get(0).following());
    }
}
