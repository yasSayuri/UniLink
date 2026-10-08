package br.com.unilink.backend.controller;

import br.com.unilink.backend.dto.AuthResponse;
import br.com.unilink.backend.dto.RegisterRequest;
import br.com.unilink.backend.dto.UserResponse;
import br.com.unilink.backend.security.JwtService;
import br.com.unilink.backend.service.AuthService;
import br.com.unilink.backend.service.CommunityCatalogService;
import br.com.unilink.backend.service.UserFollowService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CommunityCatalogService communityCatalogService;

    @MockBean
    private UserFollowService userFollowService;

    @Test
    void acceptsAValidEmailFromAnotherUniversity() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(new AuthResponse(
                "token",
                "Bearer",
                new UserResponse("id", "student.one", "Student One", "student@university.edu.br",
                        null, null, null, null, null, false, 0, 0, null, null, null, null, null, null)));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Student One",
                                  "username": "student.one",
                                  "email": "student@university.edu.br",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value("student@university.edu.br"))
                .andExpect(jsonPath("$.user.onboardingCompleted").value(false));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void rejectsAnEmailWithInvalidSyntax() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Student One",
                                  "username": "student.one",
                                  "email": "not-an-email",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Esse e-mail não é válido."));
    }

    @Test
    void rejectsPasswordsShorterThanEightCharacters() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType("application/json")
                        .content("""
                                {
                                  "name": "Student One",
                                  "username": "student.one",
                                  "email": "student.one@alunos.utfpr.edu.br",
                                  "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A senha deve ter pelo menos 8 caracteres."));
    }
}
