package br.com.unilink.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateReportRequest(
        @NotBlank(message = "Informe o motivo da denúncia.") String reason,
        Boolean blockWithReport) {

    public CreateReportRequest(String reason) {
        this(reason, false);
    }
}
