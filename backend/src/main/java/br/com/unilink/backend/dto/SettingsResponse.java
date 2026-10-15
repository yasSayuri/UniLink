package br.com.unilink.backend.dto;

import java.util.List;

public record SettingsResponse(
        boolean privateAccount,
        List<BlockedUserResponse> blockedPeople,
        List<String> blockedWords,
        List<FollowRequestResponse> followRequests) {
}
