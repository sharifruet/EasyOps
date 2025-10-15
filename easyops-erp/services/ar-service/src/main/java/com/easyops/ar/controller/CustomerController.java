package com.easyops.ar.controller;

import com.easyops.ar.dto.CustomerRequest;
import com.easyops.ar.entity.Customer;
import com.easyops.ar.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ar/customers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AR Customers", description = "Customer management for Accounts Receivable")
public class CustomerController {
    
    private final CustomerService customerService;
    
    @GetMapping
    @Operation(summary = "Get all customers for an organization")
    public ResponseEntity<List<Customer>> getAllCustomers(
            @RequestParam UUID organizationId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        
        log.info("GET /api/ar/customers - organizationId: {}, activeOnly: {}", organizationId, activeOnly);
        
        List<Customer> customers = activeOnly 
                ? customerService.getActiveCustomers(organizationId)
                : customerService.getAllCustomers(organizationId);
        
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<Customer> getCustomerById(@PathVariable UUID id) {
        log.info("GET /api/ar/customers/{}", id);
        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }
    
    @PostMapping
    @Operation(summary = "Create new customer")
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerRequest request) {
        log.info("POST /api/ar/customers - Creating customer: {}", request.getCustomerCode());
        Customer customer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable UUID id,
            @Valid @RequestBody CustomerRequest request) {
        
        log.info("PUT /api/ar/customers/{}", id);
        Customer customer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(customer);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        log.info("DELETE /api/ar/customers/{}", id);
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}

