package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.CreateReportRequest;
import br.com.unilink.backend.service.ReportService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{userId}/reports")
public class UserReportController {

    private final ReportService reportService;

    public UserReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void create(
            Principal principal,
            @PathVariable String userId,
            @Valid @RequestBody CreateReportRequest request) {
        reportService.createUser(principal.getName(), userId, request);
    }
}
