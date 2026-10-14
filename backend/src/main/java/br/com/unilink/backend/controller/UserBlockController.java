package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.BlockStatusResponse;
import br.com.unilink.backend.service.UserBlockService;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{userId}/block")
public class UserBlockController {

    private final UserBlockService userBlockService;

    public UserBlockController(UserBlockService userBlockService) {
        this.userBlockService = userBlockService;
    }

    @PostMapping
    public BlockStatusResponse block(Principal principal, @PathVariable String userId) {
        userBlockService.block(principal.getName(), userId);
        return new BlockStatusResponse(true);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unblock(Principal principal, @PathVariable String userId) {
        userBlockService.unblock(principal.getName(), userId);
    }

    @GetMapping
    public BlockStatusResponse status(Principal principal, @PathVariable String userId) {
        return new BlockStatusResponse(userBlockService.isBlocked(principal.getName(), userId));
    }
}
