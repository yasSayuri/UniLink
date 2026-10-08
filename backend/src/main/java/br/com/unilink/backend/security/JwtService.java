package br.com.unilink.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import br.com.unilink.backend.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationMs);
        return Jwts.builder()
                .subject(user.getId())
                .claim("username", user.getUsername())
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
