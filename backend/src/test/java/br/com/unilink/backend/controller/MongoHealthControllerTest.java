package br.com.unilink.backend.controller;

import br.com.unilink.backend.security.JwtService;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MongoHealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class MongoHealthControllerTest {

    @MockBean
    private JwtService jwtService;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MongoTemplate mongoTemplate;

    @Test
    void reportsDatabaseAsAvailableWhenPingSucceeds() throws Exception {
        when(mongoTemplate.executeCommand(any(Document.class))).thenReturn(new Document("ok", 1));

        mockMvc.perform(get("/api/v1/health/mongodb"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("unilink"));
    }

    @Test
    void reportsDatabaseAsUnavailableWhenPingFails() throws Exception {
        when(mongoTemplate.executeCommand(any(Document.class)))
                .thenThrow(new DataAccessResourceFailureException("MongoDB is unavailable"));

        mockMvc.perform(get("/api/v1/health/mongodb"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("DOWN"))
                .andExpect(jsonPath("$.database").value("unilink"));
    }
}
