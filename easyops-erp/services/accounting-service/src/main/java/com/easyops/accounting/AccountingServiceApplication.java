package com.easyops.accounting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableCaching
@EnableAsync
public class AccountingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AccountingServiceApplication.class, args);
    }
}

