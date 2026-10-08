package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.FollowUserResponse;
import br.com.unilink.backend.service.UserFollowService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserFollowController {

    private final UserFollowService userFollowService;

    public UserFollowController(UserFollowService userFollowService) {
        this.userFollowService = userFollowService;
    }

    @GetMapping("/following")
    public List<FollowUserResponse> following(Principal principal) {
        return userFollowService.following(principal.getName());
    }

    @GetMapping("/followers")
    public List<FollowUserResponse> followers(Principal principal) {
        return userFollowService.followers(principal.getName());
    }

    @PostMapping("/following/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void follow(Principal principal, @PathVariable String userId) {
        userFollowService.follow(principal.getName(), userId);
    }

    @DeleteMapping("/following/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(Principal principal, @PathVariable String userId) {
        userFollowService.unfollow(principal.getName(), userId);
    }

}
