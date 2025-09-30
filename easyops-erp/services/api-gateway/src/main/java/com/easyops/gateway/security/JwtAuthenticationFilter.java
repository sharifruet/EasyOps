package com.easyops.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * JWT Authentication Filter
 * 
 * This filter validates JWT tokens for API Gateway requests.
 * It extracts the token from the Authorization header and validates it.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter {

    @Value("${jwt.secret:your-jwt-secret-key-change-in-production}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();

        // Skip authentication for public endpoints
        String path = request.getURI().getPath();
        if (isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        // Extract JWT token from Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }

        String token = authHeader.substring(7);
        
        try {
            // Validate JWT token
            Claims claims = validateToken(token);
            if (claims == null) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            // Add user information to request headers
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", claims.getSubject())
                    .header("X-User-Email", claims.get("email", String.class))
                    .header("X-User-Roles", claims.get("roles", String.class))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
    }

    /**
     * Check if the endpoint is public (doesn't require authentication)
     * 
     * @param path Request path
     * @return true if public endpoint
     */
    private boolean isPublicEndpoint(String path) {
        List<String> publicEndpoints = List.of(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/refresh",
                "/health",
                "/actuator/health"
        );
        
        return publicEndpoints.stream().anyMatch(path::startsWith);
    }

    /**
     * Validate JWT token
     * 
     * @param token JWT token
     * @return Claims if valid, null otherwise
     */
    private Claims validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
