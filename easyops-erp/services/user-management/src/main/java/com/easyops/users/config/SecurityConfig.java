package com.easyops.users.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security Configuration
 * 
 * Provides security-related beans for the User Management service.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Configuration
public class SecurityConfig {

    /**
     * Password encoder bean
     * 
     * @return BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

