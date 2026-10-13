package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCommunityRequest(
        @NotBlank(message = "Informe o nome do grupo.")
        @Size(max = 100, message = "O nome do grupo deve ter no máximo 100 caracteres.")
        String name,
        @NotBlank(message = "Informe uma descrição para o grupo.")
        @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
        String description,
        @NotBlank(message = "Selecione a classificação do grupo.")
        @Size(max = 80, message = "A classificação deve ter no máximo 80 caracteres.")
        String category,
        @NotBlank(message = "Selecione a privacidade do grupo.")
        @Pattern(regexp = "PUBLIC|PRIVATE", message = "Selecione uma privacidade válida.")
        String visibility,
        String imageUrl) {
}
