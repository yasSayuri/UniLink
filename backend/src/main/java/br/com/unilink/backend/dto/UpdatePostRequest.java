package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
        @NotBlank(message = "Escreva algo antes de salvar.")
        @Size(max = 2000, message = "A publicação deve ter no máximo 2000 caracteres.")
        String content) {
}
