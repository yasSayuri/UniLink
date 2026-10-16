package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.BlockedWordRequest;
import br.com.unilink.backend.dto.ChangeEmailRequest;
import br.com.unilink.backend.dto.ChangePasswordRequest;
import br.com.unilink.backend.dto.PreferencesRequest;
import br.com.unilink.backend.dto.SettingsResponse;
import br.com.unilink.backend.service.SettingsService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public SettingsResponse get(Principal principal) {
        return settingsService.get(principal.getName());
    }

    @PatchMapping("/email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeEmail(Principal principal, @Valid @RequestBody ChangeEmailRequest request) {
        settingsService.changeEmail(principal.getName(), request.currentEmail(), request.newEmail(), request.confirmation());
    }

    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        settingsService.changePassword(principal.getName(), request.newPassword(), request.confirmation());
    }

    @PatchMapping("/preferences")
    public SettingsResponse updatePreferences(Principal principal, @RequestBody PreferencesRequest request) {
        settingsService.updatePreferences(principal.getName(), request.privateAccount(), request.darkMode());
        return settingsService.get(principal.getName());
    }

    @PostMapping("/blocked-words")
    public SettingsResponse addBlockedWord(Principal principal, @Valid @RequestBody BlockedWordRequest request) {
        settingsService.addBlockedWord(principal.getName(), request.word());
        return settingsService.get(principal.getName());
    }

    @DeleteMapping("/blocked-words/{word}")
    public SettingsResponse removeBlockedWord(Principal principal, @PathVariable String word) {
        settingsService.removeBlockedWord(principal.getName(), word);
        return settingsService.get(principal.getName());
    }

    @DeleteMapping("/blocked-people/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unblock(Principal principal, @PathVariable String userId) {
        settingsService.unblock(principal.getName(), userId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Principal principal) {
        settingsService.deleteAccount(principal.getName());
    }
}
