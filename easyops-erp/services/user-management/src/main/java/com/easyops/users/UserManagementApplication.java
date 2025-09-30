package com.easyops.users;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

/**
 * User Management Application
 * 
 * This is the User Management service for the EasyOps ERP system.
 * It provides user registration, authentication, profile management,
 * and user administration capabilities.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableEurekaClient
public class UserManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserManagementApplication.class, args);
    }
}
