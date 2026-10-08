package br.com.unilink.backend.config;

import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Dados inválidos.");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", exception.getReason()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateKey(DuplicateKeyException exception) {
        String message = exception.getMessage() != null && exception.getMessage().contains("username")
                ? "Esse usuário já existe."
                : "Esse e-mail já foi cadastrado.";
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
    }
}
