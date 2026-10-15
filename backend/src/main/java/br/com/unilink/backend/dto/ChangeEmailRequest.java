package br.com.unilink.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(
        @NotBlank(message = "Informe seu e-mail atual.") @Email String currentEmail,
        @NotBlank(message = "Informe o novo e-mail.") @Email String newEmail,
        @NotBlank(message = "Confirme o novo e-mail.") @Email String confirmation) {
}
