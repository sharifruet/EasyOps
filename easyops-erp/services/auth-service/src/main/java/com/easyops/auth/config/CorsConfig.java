package com.easyops.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS Configuration
 * 
 * Disables CORS in auth-service since API Gateway handles it.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Return a configuration source that doesn't add any CORS headers
        // API Gateway will handle all CORS
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Don't register any CORS configuration - this prevents Spring from adding headers
        return source;
    }
}

