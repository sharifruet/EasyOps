package com.easyops.organization;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Organization Service Application
 * 
 * This service handles multi-tenancy and organization management
 * for the EasyOps ERP system.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
public class OrganizationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrganizationServiceApplication.class, args);
    }
}

