package com.easyops.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway Configuration
 * 
 * Configures the API Gateway routes and filters for the EasyOps ERP system.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Configuration
public class GatewayConfig {

    /**
     * Configure API Gateway routes
     * 
     * @param builder RouteLocatorBuilder
     * @return RouteLocator
     */
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // User Management Service Routes
                .route("user-management", r -> r.path("/api/users/**")
                        .uri("lb://user-management-service"))
                
                // Authentication Service Routes
                .route("auth-service", r -> r.path("/api/auth/**")
                        .uri("lb://auth-service"))
                
                // RBAC Service Routes
                .route("rbac-service", r -> r.path("/api/rbac/**")
                        .uri("lb://rbac-service"))
                
                // System Configuration Service Routes
                .route("system-config", r -> r.path("/api/system/**")
                        .uri("lb://system-config-service"))
                
                // Monitoring Service Routes
                .route("monitoring-service", r -> r.path("/api/monitoring/**")
                        .uri("lb://monitoring-service"))
                
                // Health Check Routes
                .route("health-check", r -> r.path("/health/**")
                        .uri("lb://user-management-service"))
                
                .build();
    }
}
