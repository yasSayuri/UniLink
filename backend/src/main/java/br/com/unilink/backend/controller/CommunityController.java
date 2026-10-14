package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.CommunityResponse;
import br.com.unilink.backend.dto.CommunityJoinRequestResponse;
import br.com.unilink.backend.dto.CommunityMemberResponse;
import br.com.unilink.backend.dto.CreateCommunityRequest;
import br.com.unilink.backend.dto.CreateReportRequest;
import br.com.unilink.backend.dto.PostResponse;
import br.com.unilink.backend.service.CommunityCatalogService;
import br.com.unilink.backend.service.PostService;
import br.com.unilink.backend.service.ReportService;
import java.util.List;
import java.security.Principal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private final ReportService reportService;

    public CommunityController(
            CommunityCatalogService communityCatalogService,
            PostService postService,
            ReportService reportService) {
        this.communityCatalogService = communityCatalogService;
        this.postService = postService;
        this.reportService = reportService;
    }

    @GetMapping
    public List<CommunityResponse> list(Principal principal) {
        return communityCatalogService.list(principal.getName());
    }

    @GetMapping("/requests")
    public List<CommunityJoinRequestResponse> joinRequests(Principal principal) {
        return communityCatalogService.listJoinRequests(principal.getName());
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

    @PostMapping("/{communityId}/leave")
    public CommunityResponse leave(Principal principal, @PathVariable String communityId) {
        return communityCatalogService.leave(communityId, principal.getName());
    }

    @GetMapping("/{communityId}/members")
    public List<CommunityMemberResponse> members(Principal principal, @PathVariable String communityId) {
        return communityCatalogService.members(communityId, principal.getName());
    }

    @PostMapping("/{communityId}/members/{memberId}/remove")
    public CommunityResponse removeMember(
            Principal principal,
            @PathVariable String communityId,
            @PathVariable String memberId) {
        return communityCatalogService.removeMember(communityId, principal.getName(), memberId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityResponse create(Principal principal, @Valid @RequestBody CreateCommunityRequest request) {
        return communityCatalogService.create(request, principal.getName());
    }

    @PostMapping("/{communityId}/requests/{requesterId}/approve")
    public CommunityResponse approveJoinRequest(
            Principal principal,
            @PathVariable String communityId,
            @PathVariable String requesterId) {
        return communityCatalogService.approveJoinRequest(communityId, requesterId, principal.getName());
    }

    @PostMapping("/{communityId}/requests/{requesterId}/reject")
    public CommunityResponse rejectJoinRequest(
            Principal principal,
            @PathVariable String communityId,
            @PathVariable String requesterId) {
        return communityCatalogService.rejectJoinRequest(communityId, requesterId, principal.getName());
    }

    @PostMapping("/{communityId}/reports")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void report(
            Principal principal,
            @PathVariable String communityId,
            @Valid @RequestBody CreateReportRequest request) {
        reportService.createCommunity(principal.getName(), communityId, request);
    }
}
