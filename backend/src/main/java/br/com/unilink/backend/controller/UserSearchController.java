package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.UserSuggestionResponse;
import br.com.unilink.backend.service.UserSearchService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserSearchController {

    private final UserSearchService userSearchService;

    public UserSearchController(UserSearchService userSearchService) {
        this.userSearchService = userSearchService;
    }

    @GetMapping("/search")
    public List<UserSuggestionResponse> search(Principal principal, @RequestParam String q) {
        return userSearchService.search(principal.getName(), q);
    }

    @GetMapping("/suggestions")
    public List<UserSuggestionResponse> suggestions(Principal principal) {
        return userSearchService.suggestions(principal.getName());
    }
}
