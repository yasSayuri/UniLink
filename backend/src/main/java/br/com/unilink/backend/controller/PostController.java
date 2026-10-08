package br.com.unilink.backend.controller;

import java.security.Principal;
import java.util.List;

import br.com.unilink.backend.dto.CreatePostRequest;
import br.com.unilink.backend.dto.CreateCommentRequest;
import br.com.unilink.backend.dto.PostResponse;
import br.com.unilink.backend.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostResponse> list(Principal principal) {
        return postService.list(principal.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(Principal principal, @Valid @RequestBody CreatePostRequest request) {
        return postService.create(principal.getName(), request);
    }

    @PostMapping("/{postId}/likes")
    public PostResponse like(Principal principal, @PathVariable String postId) {
        return postService.like(principal.getName(), postId);
    }

    @DeleteMapping("/{postId}/likes")
    public PostResponse unlike(Principal principal, @PathVariable String postId) {
        return postService.unlike(principal.getName(), postId);
    }

    @PostMapping("/{postId}/comments")
    public PostResponse comment(
            Principal principal,
            @PathVariable String postId,
            @Valid @RequestBody CreateCommentRequest request) {
        return postService.comment(principal.getName(), postId, request.content());
    }

    @PostMapping("/{postId}/reposts")
    public PostResponse repost(Principal principal, @PathVariable String postId) {
        return postService.repost(principal.getName(), postId);
    }

    @DeleteMapping("/{postId}/reposts")
    public PostResponse undoRepost(Principal principal, @PathVariable String postId) {
        return postService.undoRepost(principal.getName(), postId);
    }
}
