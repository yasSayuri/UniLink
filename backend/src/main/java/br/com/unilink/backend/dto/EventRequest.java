package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EventRequest(
        @NotBlank(message = "Informe o nome do evento.")
        @Size(max = 120, message = "O nome do evento deve ter no máximo 120 caracteres.")
        String title,
        @NotBlank(message = "Informe uma descrição para o evento.")
        @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres.")
        String description,
        @NotBlank(message = "Selecione uma categoria.")
        String category,
        @NotBlank(message = "Informe a data do evento.")
        String date,
        @NotBlank(message = "Informe o horário do evento.")
        String time,
        @NotBlank(message = "Informe o local do evento.")
        String location,
        String imageUrl,
        Integer imagePositionX,
        Integer imagePositionY) {
}
