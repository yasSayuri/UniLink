package br.com.unilink.backend.service;

import br.com.unilink.backend.dto.RegisterRequest;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserRepository;
import br.com.unilink.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private CommunityCatalogService communityCatalogService;

    @Mock
    private UserFollowService userFollowService;

    @InjectMocks
    private AuthService authService;

    @Test
    void rejectsAnExistingUsername() {
        when(userRepository.existsByUsername("student.one")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.register(new RegisterRequest(
                        "Student One", "Student.One", "student.one@alunos.utfpr.edu.br", "password123")));

        assertEquals("Esse usuário já existe.", exception.getReason());
    }

    @Test
    void rejectsAnExistingEmail() {
        when(userRepository.existsByUsername("student.one")).thenReturn(false);
        when(userRepository.existsByEmail("student.one@alunos.utfpr.edu.br")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.register(new RegisterRequest(
                        "Student One", "student.one", "student.one@alunos.utfpr.edu.br", "password123")));

        assertEquals("Esse e-mail já foi cadastrado.", exception.getReason());
    }

    @Test
    void normalizesIdentityAndHashesPasswordWhenRegistering() {
        when(userRepository.existsByUsername("student.one")).thenReturn(false);
        when(userRepository.existsByEmail("student.one@alunos.utfpr.edu.br")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");
        when(userFollowService.followersCount(any())).thenReturn(0L);
        when(userFollowService.followingCount(any())).thenReturn(0L);

        authService.register(new RegisterRequest(
                " Student One ", "Student.One", "Student.One@alunos.utfpr.edu.br", "password123"));

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("student.one", savedUser.getValue().getUsername());
        assertEquals("student.one@alunos.utfpr.edu.br", savedUser.getValue().getEmail());
        assertEquals("Student One", savedUser.getValue().getName());
        assertEquals("bcrypt-hash", savedUser.getValue().getPasswordHash());
        verify(communityCatalogService).ensureDefaultCommunities();
    }
}
