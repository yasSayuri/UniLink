package br.com.unilink.backend.controller;

import java.util.List;

import br.com.unilink.backend.dto.InstitutionOption;
import br.com.unilink.backend.service.AcademicCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalog")
public class AcademicCatalogController {

    private final AcademicCatalogService catalogService;

    public AcademicCatalogController(AcademicCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/institutions")
    public List<InstitutionOption> institutions() {
        return catalogService.institutions();
    }

    @GetMapping("/campuses")
    public List<String> campuses(
            @RequestParam String institutionName,
            @RequestParam(required = false) String institutionDomain) {
        return catalogService.campuses(institutionName, institutionDomain);
    }

    @GetMapping("/courses")
    public List<String> courses(
            @RequestParam String institutionName,
            @RequestParam(required = false) String institutionDomain,
            @RequestParam(required = false) String campus) {
        return catalogService.courses(institutionName, institutionDomain, campus);
    }

    @GetMapping("/periods")
    public List<Integer> academicPeriods() {
        return catalogService.academicPeriods();
    }
}
