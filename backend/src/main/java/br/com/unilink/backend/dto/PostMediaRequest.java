package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostMediaRequest(
        @NotBlank(message = "O nome do arquivo de mídia é obrigatório.")
        @Size(max = 255, message = "O nome do arquivo deve ter no máximo 255 caracteres.")
        String fileName,
        @NotBlank(message = "O tipo do arquivo de mídia é obrigatório.")
        String contentType,
        @NotBlank(message = "Os dados do arquivo de mídia são obrigatórios.")
        @Size(max = 7_000_000, message = "Cada arquivo de mídia deve ter no máximo 5 MB.")
        String dataUrl) {
}
