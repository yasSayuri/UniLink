package br.com.unilink.backend.service;

import java.util.Optional;

import br.com.unilink.backend.dto.OnboardingRequest;
import br.com.unilink.backend.dto.UpdateProfileRequest;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OnboardingServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowService userFollowService;

    @InjectMocks
    private OnboardingService onboardingService;

    @Test
    void savesAcademicProfileAndMarksOnboardingComplete() {
        User user = new User("student.one", "Student One", "student@university.edu.br", "hash");
        when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = onboardingService.complete("user-id", new OnboardingRequest(
                "Universidade", "university.edu.br", "Campus Central", "Computação", 3));

        verify(userRepository).save(user);
        assertEquals("Universidade", result.institutionName());
        assertEquals("university.edu.br", result.institutionDomain());
        assertEquals("Campus Central", result.campus());
        assertEquals("Computação", result.course());
        assertEquals(3, result.academicPeriod());
        assertTrue(result.onboardingCompleted());
    }

    @Test
    void updatesProfileNameAndNormalizesUsername() {
        User user = new User("student.one", "Student One", "student@university.edu.br", "hash");
        when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
        when(userRepository.existsByUsernameAndIdNot("new.name", "user-id")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = onboardingService.updateProfile("user-id", new UpdateProfileRequest("New Name", "New.Name", null, null, null, null, null, null));

        assertEquals("New Name", result.name());
        assertEquals("new.name", result.username());
        verify(userRepository).save(user);
    }
}
