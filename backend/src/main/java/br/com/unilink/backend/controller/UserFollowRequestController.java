package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.FollowRequestResponse;
import br.com.unilink.backend.service.NotificationService;
import br.com.unilink.backend.service.UserFollowRequestService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/follow-requests")
public class UserFollowRequestController {

    private final UserFollowRequestService requestService;
    private final NotificationService notificationService;

    public UserFollowRequestController(
            UserFollowRequestService requestService,
            NotificationService notificationService) {
        this.requestService = requestService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<FollowRequestResponse> pending(Principal principal) {
        return requestService.pendingFor(principal.getName());
    }

    @PostMapping("/{requesterId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void accept(Principal principal, @PathVariable String requesterId) {
        requestService.accept(principal.getName(), requesterId);
        notificationService.deleteFollowRequestNotifications(principal.getName(), requesterId);
    }

    @PostMapping("/{requesterId}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approve(Principal principal, @PathVariable String requesterId) {
        requestService.accept(principal.getName(), requesterId);
    }

    @PostMapping("/{requesterId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(Principal principal, @PathVariable String requesterId) {
        requestService.reject(principal.getName(), requesterId);
        notificationService.deleteFollowRequestNotifications(principal.getName(), requesterId);
    }
}
