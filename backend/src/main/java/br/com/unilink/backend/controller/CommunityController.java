package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.CommunityResponse;
import br.com.unilink.backend.dto.PostResponse;
import br.com.unilink.backend.service.CommunityCatalogService;
import br.com.unilink.backend.service.PostService;
import java.util.List;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/communities")
public class CommunityController {

    private final CommunityCatalogService communityCatalogService;
    private final PostService postService;

    public CommunityController(CommunityCatalogService communityCatalogService, PostService postService) {
        this.communityCatalogService = communityCatalogService;
        this.postService = postService;
    }

    @GetMapping
    public List<CommunityResponse> list(Principal principal) {
        return communityCatalogService.list(principal.getName());
    }

    @GetMapping("/posts")
    public List<PostResponse> posts(Principal principal, @RequestParam(required = false) String name) {
        return postService.communityPosts(name, principal.getName());
    }

    @PostMapping("/{communityId}/join")
    @ResponseStatus(HttpStatus.OK)
    public CommunityResponse joinOrRequest(Principal principal, @PathVariable String communityId) {
        return communityCatalogService.joinOrRequest(communityId, principal.getName());
    }
}
