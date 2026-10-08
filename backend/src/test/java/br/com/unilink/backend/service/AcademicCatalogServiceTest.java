package br.com.unilink.backend.service;

import java.util.List;

import br.com.unilink.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AcademicCatalogServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private AcademicCatalogService catalogService;
    private MockRestServiceServer directoryServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder clientBuilder = RestClient.builder();
        directoryServer = MockRestServiceServer.bindTo(clientBuilder).build();
        catalogService = new AcademicCatalogService(clientBuilder, userRepository);
    }

    @Test
    void providesUtfprCampusesAndAcademicPeriods() {
        assertEquals(13, catalogService.campuses("UTFPR", null).size());
        assertEquals("Curitiba", catalogService.campuses("UTFPR", null).get(3));
        assertEquals(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), catalogService.academicPeriods());
    }

    @Test
    void includesPopularUniversitiesInItsCatalog() {
        directoryServer.expect(requestTo("https://universities.hipolabs.com/search?country=Brazil"))
                .andRespond(withSuccess("""
                        [
                          {"name":"Universidade Tecnológica Federal do Paraná","domains":["utfpr.edu.br"]},
                          {"name":"rtet","domains":["rtet.edu.br"]},
                          {"name":"Universidade Exemplo","domains":["exemplo.edu.br"]}
                        ]
                        """, MediaType.APPLICATION_JSON));

        var institutions = catalogService.institutions();

        assertEquals("Universidade Tecnológica Federal do Paraná (UTFPR)", institutions.get(0).name());
        org.junit.jupiter.api.Assertions.assertTrue(
                institutions.stream().anyMatch(item -> item.name().contains("(USP)")));
        org.junit.jupiter.api.Assertions.assertTrue(
                institutions.stream().anyMatch(item -> item.name().contains("(UFRJ)")));
        assertEquals(1, institutions.stream()
                .filter(item -> item.name().startsWith("Universidade Tecnológica Federal do Paraná"))
                .count());
        org.junit.jupiter.api.Assertions.assertFalse(institutions.stream().anyMatch(item -> item.name().equals("rtet")));
        org.junit.jupiter.api.Assertions.assertTrue(
                institutions.stream().anyMatch(item -> item.name().equals("Universidade Exemplo")));
        directoryServer.verify();
    }

    @Test
    void listsUtfprCoursesForTheSelectedCampus() {
        assertEquals(
                List.of(
                        "Ciência da Computação",
                        "Engenharia Civil",
                        "Engenharia de Alimentos",
                        "Engenharia Eletrônica",
                        "Licenciatura em Química",
                        "Tecnologia de Alimentos"),
                catalogService.courses(
                        "Universidade Tecnológica Federal do Paraná (UTFPR)",
                        "utfpr.edu.br",
                        "Campo Mourão"));
        assertEquals(List.of(), catalogService.courses("UTFPR", "utfpr.edu.br", "Curitiba"));
    }

    @Test
    void doesNotUseStudentProfileTextAsAnAcademicCourseCatalog() {
        var firstUser = new br.com.unilink.backend.model.User(
                "first", "First", "first@university.edu.br", "hash");
        firstUser.completeOnboarding("Universidade", "university.edu.br", "Campus Centro", "Computação", 2);
        var secondUser = new br.com.unilink.backend.model.User(
                "second", "Second", "second@university.edu.br", "hash");
        secondUser.completeOnboarding("Universidade", "university.edu.br", "Campus Centro", "Engenharia", 4);
        when(userRepository.findAll()).thenReturn(List.of(firstUser, secondUser));

        assertEquals(List.of("Campus Centro"), catalogService.campuses("Universidade", "university.edu.br"));
        assertEquals(
                List.of(),
                catalogService.courses("Universidade", "university.edu.br", "Campus Centro"));
    }
}
