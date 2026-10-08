package br.com.unilink.backend.controller;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.bson.Document;

@RestController
@RequestMapping("/api/v1/health/mongodb")
public class MongoHealthController {

    private final MongoTemplate mongoTemplate;

    public MongoHealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public ResponseEntity<MongoHealthResponse> health() {
        try {
            mongoTemplate.executeCommand(new Document("ping", 1));
            return ResponseEntity.ok(new MongoHealthResponse("UP", "unilink"));
        } catch (DataAccessException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new MongoHealthResponse("DOWN", "unilink"));
        }
    }

    public record MongoHealthResponse(String status, String database) {
    }
}
