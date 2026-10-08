package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.OnboardingRequest;
import br.com.unilink.backend.dto.UpdateProfileRequest;
import br.com.unilink.backend.dto.UserResponse;
import br.com.unilink.backend.service.OnboardingService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping
    public UserResponse currentUser(Principal principal) {
        return onboardingService.getCurrentUser(principal.getName());
    }

    @PatchMapping("/onboarding")
    public UserResponse completeOnboarding(
            Principal principal,
            @Valid @RequestBody OnboardingRequest request) {
        return onboardingService.complete(principal.getName(), request);
    }

    @PatchMapping("/profile")
    public UserResponse updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return onboardingService.updateProfile(principal.getName(), request);
    }
}
