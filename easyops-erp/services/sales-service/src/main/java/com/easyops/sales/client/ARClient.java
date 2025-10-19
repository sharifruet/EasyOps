package com.easyops.sales.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ar-service", url = "${services.ar.url}")
public interface ARClient {
    
    @PostMapping("/api/ar/invoices")
    Map<String, Object> createInvoice(@RequestBody Map<String, Object> invoiceRequest);
}

