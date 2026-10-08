package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import java.util.List;

public record CreatePostRequest(
        @NotBlank(message = "Escreva algo antes de publicar.")
        @Size(max = 2000, message = "A publicação deve ter no máximo 2000 caracteres.")
        String content,
        @Pattern(regexp = "PUBLIC|PRIVATE|FOLLOWERS", message = "Selecione uma opção de privacidade válida.")
        String privacy,
        @Size(max = 100, message = "O nome da comunidade deve ter no máximo 100 caracteres.")
        String communityName,
        @Size(max = 4, message = "Você pode anexar no máximo 4 arquivos.")
        List<@Valid PostMediaRequest> media) {
}
