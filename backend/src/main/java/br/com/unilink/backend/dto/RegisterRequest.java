package br.com.unilink.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,
        @NotBlank(message = "Informe um username.")
        @Pattern(
                regexp = "^[a-zA-Z0-9._]{3,30}$",
                message = "O username deve ter de 3 a 30 caracteres (letras, números, ponto ou sublinhado).")
        String username,
        @NotBlank(message = "Informe seu e-mail.")
        @Email(message = "Esse e-mail não é válido.")
        String email,
        @NotBlank(message = "Informe uma senha.")
        @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres.")
        String password) {
}
