package br.com.unilink.backend.service;

import java.util.Locale;

import br.com.unilink.backend.dto.AuthResponse;
import br.com.unilink.backend.dto.LoginRequest;
import br.com.unilink.backend.dto.RegisterRequest;
import br.com.unilink.backend.dto.UserResponse;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserRepository;
import br.com.unilink.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CommunityCatalogService communityCatalogService;
    private final UserFollowService userFollowService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CommunityCatalogService communityCatalogService,
            UserFollowService userFollowService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.communityCatalogService = communityCatalogService;
        this.userFollowService = userFollowService;
    }

    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim().toLowerCase(Locale.ROOT);
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse usuário já existe.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esse e-mail já foi cadastrado.");
        }

        User user = userRepository.save(new User(
                username,
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())));
        return createAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .filter(existingUser -> passwordEncoder.matches(request.password(), existingUser.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha incorretos."));
        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getInstitutionName(),
                user.getInstitutionDomain(),
                user.getCampus(),
                user.getCourse(),
                user.getAcademicPeriod(),
                user.isOnboardingCompleted(),
                userFollowService.followersCount(user.getId()),
                userFollowService.followingCount(user.getId()),
                user.getAvatarUrl(),
                user.getHeaderUrl(),
                user.getAvatarPositionX(),
                user.getAvatarPositionY(),
                user.getHeaderPositionX(),
                user.getHeaderPositionY());
        return new AuthResponse(jwtService.generateToken(user), "Bearer", userResponse);
    }
}
