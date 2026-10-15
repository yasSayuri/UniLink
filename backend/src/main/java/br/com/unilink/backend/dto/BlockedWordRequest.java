package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BlockedWordRequest(
        @NotBlank(message = "Informe uma palavra.") @Size(max = 80, message = "A palavra deve ter no máximo 80 caracteres.") String word) {
}
