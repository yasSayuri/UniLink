package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Informe a nova senha.") @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.") String newPassword,
        @NotBlank(message = "Confirme a nova senha.") String confirmation) {
}
