package br.com.unilink.backend.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;

import br.com.unilink.backend.dto.InstitutionOption;
import br.com.unilink.backend.model.User;
import br.com.unilink.backend.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AcademicCatalogService {

    private static final String UTFPR_DOMAIN = "utfpr.edu.br";
    private static final List<InstitutionOption> POPULAR_INSTITUTIONS = List.of(
            institution("Universidade Tecnológica Federal do Paraná (UTFPR)", "utfpr.edu.br"),
            institution("Universidade de São Paulo (USP)", "usp.br"),
            institution("Universidade Estadual de Campinas (UNICAMP)", "unicamp.br"),
            institution("Universidade Estadual Paulista (UNESP)", "unesp.br"),
            institution("Universidade Federal do Paraná (UFPR)", "ufpr.br"),
            institution("Universidade Federal do Rio de Janeiro (UFRJ)", "ufrj.br"),
            institution("Universidade Federal de Minas Gerais (UFMG)", "ufmg.br"),
            institution("Universidade Federal do Rio Grande do Sul (UFRGS)", "ufrgs.br"),
            institution("Universidade Federal de Santa Catarina (UFSC)", "ufsc.br"),
            institution("Universidade de Brasília (UnB)", "unb.br"),
            institution("Universidade Federal de São Carlos (UFSCar)", "ufscar.br"),
            institution("Universidade Federal Fluminense (UFF)", "uff.br"),
            institution("Universidade Federal da Bahia (UFBA)", "ufba.br"),
            institution("Universidade Federal do Ceará (UFC)", "ufc.br"),
            institution("Universidade Federal de Pernambuco (UFPE)", "ufpe.br"),
            institution("Universidade Federal do Rio Grande do Norte (UFRN)", "ufrn.br"),
            institution("Universidade Federal de São Paulo (UNIFESP)", "unifesp.br"),
            institution("Universidade do Estado do Rio de Janeiro (UERJ)", "uerj.br"),
            institution("Universidade Estadual de Maringá (UEM)", "uem.br"),
            institution("Universidade Estadual de Londrina (UEL)", "uel.br"),
            institution("Pontifícia Universidade Católica do Paraná (PUCPR)", "pucpr.br"),
            institution("Pontifícia Universidade Católica do Rio de Janeiro (PUC-Rio)", "puc-rio.br"),
            institution("Pontifícia Universidade Católica de São Paulo (PUC-SP)", "pucsp.br"),
            institution("Universidade Presbiteriana Mackenzie", "mackenzie.br"),
            institution("Fundação Getulio Vargas (FGV)", "fgv.br"),
            institution("Insper", "insper.edu.br"));
    private static final List<String> UTFPR_CAMPUSES = List.of(
            "Apucarana",
            "Campo Mourão",
            "Cornélio Procópio",
            "Curitiba",
            "Dois Vizinhos",
            "Francisco Beltrão",
            "Guarapuava",
            "Londrina",
            "Medianeira",
            "Pato Branco",
            "Ponta Grossa",
            "Santa Helena",
            "Toledo");
    private static final Map<String, List<String>> UTFPR_COURSES_BY_CAMPUS = Map.of(
            normalizeCampus("Campo Mourão"),
            List.of(
                    "Ciência da Computação",
                    "Engenharia Civil",
                    "Engenharia de Alimentos",
                    "Engenharia Eletrônica",
                    "Licenciatura em Química",
                    "Tecnologia de Alimentos"));

    private final RestClient directoryClient;
    private final UserRepository userRepository;
    private volatile List<InstitutionOption> cachedInstitutions;

    public AcademicCatalogService(RestClient.Builder restClientBuilder, UserRepository userRepository) {
        this.directoryClient = restClientBuilder
                .baseUrl("https://universities.hipolabs.com")
                .build();
        this.userRepository = userRepository;
    }

    public List<InstitutionOption> institutions() {
        if (cachedInstitutions != null) {
            return cachedInstitutions;
        }
        synchronized (this) {
            if (cachedInstitutions == null) {
                Map<String, InstitutionOption> merged = new LinkedHashMap<>();
                POPULAR_INSTITUTIONS.forEach(item -> merged.put(normalizeName(item.name()), item));
                try {
                    List<DirectoryInstitution> institutions = directoryClient.get()
                            .uri("/search?country=Brazil")
                            .retrieve()
                            .body(new ParameterizedTypeReference<>() {});
                    if (institutions != null) {
                        institutions.stream()
                                .filter(this::isUsableDirectoryEntry)
                                .map(item -> new InstitutionOption(item.name().trim(), item.domains()))
                                .forEach(item -> merged.putIfAbsent(normalizeName(item.name()), item));
                    }
                } catch (RestClientException exception) {
                    // Keep the curated universities available when the public directory is down.
                }
                cachedInstitutions = List.copyOf(merged.values());
            }
            return cachedInstitutions;
        }
    }

    public List<String> campuses(String institutionName, String institutionDomain) {
        if (isUtfpr(institutionName, institutionDomain)) {
            return UTFPR_CAMPUSES;
        }
        return userRepository.findAll().stream()
                .filter(user -> sameInstitution(user, institutionName, institutionDomain))
                .map(User::getCampus)
                .filter(value -> value != null && !value.isBlank())
                .collect(java.util.stream.Collectors.toCollection(TreeSet::new))
                .stream()
                .toList();
    }

    public List<String> courses(String institutionName, String institutionDomain, String campus) {
        if (isUtfpr(institutionName, institutionDomain)) {
            if (campus == null || campus.isBlank()) {
                return List.of();
            }
            return UTFPR_COURSES_BY_CAMPUS.getOrDefault(normalizeCampus(campus), List.of());
        }
        return List.of();
    }

    public List<Integer> academicPeriods() {
        return java.util.stream.IntStream.rangeClosed(1, 12).boxed().toList();
    }

    private boolean sameInstitution(User user, String institutionName, String institutionDomain) {
        return equalsIgnoreCase(user.getInstitutionDomain(), institutionDomain)
                || equalsIgnoreCase(user.getInstitutionName(), institutionName);
    }

    private boolean isUtfpr(String institutionName, String institutionDomain) {
        return equalsIgnoreCase(institutionDomain, UTFPR_DOMAIN)
                || (institutionName != null && institutionName.toLowerCase(Locale.ROOT).contains("utfpr"));
    }

    private boolean equalsIgnoreCase(String first, String second) {
        return first != null && second != null && first.equalsIgnoreCase(second);
    }

    private boolean isUsableDirectoryEntry(DirectoryInstitution institution) {
        return institution.name() != null
                && institution.name().trim().length() >= 5
                && institution.domains() != null
                && institution.domains().stream().anyMatch(domain -> domain != null && domain.contains("."));
    }

    private String normalizeName(String name) {
        return name.toLowerCase(Locale.ROOT)
                .replaceAll("\\([^)]*\\)", "")
                .replaceAll("[^a-z0-9]", "");
    }

    private static String normalizeCampus(String campus) {
        return campus.trim().toLowerCase(Locale.ROOT);
    }

    private static InstitutionOption institution(String name, String domain) {
        return new InstitutionOption(name, List.of(domain));
    }

    private record DirectoryInstitution(
            String name,
            List<String> domains,
            @JsonProperty("state-province") String stateProvince) {
    }
}
