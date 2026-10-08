package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,
        @NotBlank(message = "Informe um username.")
        @Pattern(
                regexp = "^[a-zA-Z0-9._]{3,30}$",
                message = "O username deve ter de 3 a 30 caracteres (letras, números, ponto ou sublinhado).")
        String username,
        String avatarUrl,
        String headerUrl,
        Integer avatarPositionX,
        Integer avatarPositionY,
        Integer headerPositionX,
        Integer headerPositionY) {
}
