package com.example.Abacus.service;


import com.example.Abacus.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // 🔥 Use fixed secret (put in application.properties later)
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long expirationTime;

    // ================= GENERATE TOKEN =================

    public String generateToken(String email, UserRole role) {

        return Jwts.builder()
                .setSubject(email)   // ✅ THIS IS IMPORTANT (email goes here)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================= EXTRACT =================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // ================= VALIDATE =================

    //    public boolean validateToken(String token, String email) {
//        final String username = extractUsername(token);
//        return (username.equals(email) && !isTokenExpired(token));
//    }
    public boolean validateToken(String token, UserDetails userDetails) {

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ================= COMMON =================

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey() {
        byte[] keyBytes = resolveSecretKeyBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] resolveSecretKeyBytes() {
        String normalizedSecret = SECRET_KEY == null ? "" : SECRET_KEY.trim();

        if (normalizedSecret.isEmpty()) {
            throw new IllegalStateException("JWT secret is missing. Set jwt.secret or JWT_SECRET to a value with at least 32 bytes.");
        }

        try {
            byte[] decodedSecret = Decoders.BASE64.decode(normalizedSecret);
            if (decodedSecret.length >= 32) {
                return decodedSecret;
            }
        } catch (IllegalArgumentException ignored) {
            // Not a Base64 secret; fall back to the raw string bytes below.
        }

        byte[] rawSecret = normalizedSecret.getBytes(StandardCharsets.UTF_8);
        if (rawSecret.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes for HS256. Update jwt.secret or JWT_SECRET.");
        }

        return rawSecret;
    }
}
