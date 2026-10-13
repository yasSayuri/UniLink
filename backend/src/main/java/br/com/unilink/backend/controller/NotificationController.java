package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.NotificationResponse;
import br.com.unilink.backend.service.NotificationService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(Principal principal) {
        return notificationService.list(principal.getName());
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markAsRead(Principal principal, @PathVariable String notificationId) {
        return notificationService.markAsRead(principal.getName(), notificationId);
    }
}
