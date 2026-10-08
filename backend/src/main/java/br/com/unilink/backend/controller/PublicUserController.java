package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.PublicUserResponse;
import br.com.unilink.backend.dto.PostResponse;
import br.com.unilink.backend.dto.FollowUserResponse;
import br.com.unilink.backend.service.OnboardingService;
import br.com.unilink.backend.service.PostService;
import br.com.unilink.backend.service.UserFollowService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class PublicUserController {

    private final OnboardingService onboardingService;
    private final PostService postService;
    private final UserFollowService userFollowService;

    public PublicUserController(
            OnboardingService onboardingService,
            PostService postService,
            UserFollowService userFollowService) {
        this.onboardingService = onboardingService;
        this.postService = postService;
        this.userFollowService = userFollowService;
    }

    @GetMapping("/{userId}")
    public PublicUserResponse profile(Principal principal, @PathVariable String userId) {
        return onboardingService.getPublicUser(userId, principal.getName());
    }

    @GetMapping("/{userId}/posts")
    public List<PostResponse> posts(Principal principal, @PathVariable String userId) {
        return postService.profilePosts(userId, principal.getName());
    }

    @GetMapping("/{userId}/following")
    public List<FollowUserResponse> following(Principal principal, @PathVariable String userId) {
        return userFollowService.following(userId, principal.getName());
    }

    @GetMapping("/{userId}/followers")
    public List<FollowUserResponse> followers(Principal principal, @PathVariable String userId) {
        return userFollowService.followers(userId, principal.getName());
    }
}
