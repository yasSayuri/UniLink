package br.com.unilink.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OnboardingRequest(
        @NotBlank(message = "Selecione ou informe sua instituição.")
        @Size(max = 200, message = "O nome da instituição deve ter no máximo 200 caracteres.")
        String institutionName,
        @Size(max = 100, message = "O domínio deve ter no máximo 100 caracteres.")
        String institutionDomain,
        @NotBlank(message = "Selecione ou informe seu campus.")
        @Size(max = 150, message = "O nome do campus deve ter no máximo 150 caracteres.")
        String campus,
        @NotBlank(message = "Informe seu curso.")
        @Size(max = 150, message = "O nome do curso deve ter no máximo 150 caracteres.")
        String course,
        @NotNull(message = "Selecione seu período.")
        @Min(value = 1, message = "O período deve estar entre 1 e 12.")
        @Max(value = 12, message = "O período deve estar entre 1 e 12.")
        Integer academicPeriod) {
}
