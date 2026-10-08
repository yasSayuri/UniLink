package br.com.unilink.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Informe seu e-mail.")
        @Email(message = "Esse e-mail não é válido.")
        String email,
        @NotBlank(message = "Informe sua senha.")
        String password) {
}
