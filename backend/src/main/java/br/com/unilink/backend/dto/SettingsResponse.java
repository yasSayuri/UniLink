package br.com.unilink.backend.dto;

import java.util.List;

public record SettingsResponse(
        boolean privateAccount,
        boolean darkMode,
        List<BlockedUserResponse> blockedPeople,
        List<String> blockedWords,
        List<FollowRequestResponse> followRequests) {
}
