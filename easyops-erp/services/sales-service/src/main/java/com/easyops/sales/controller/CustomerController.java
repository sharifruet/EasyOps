package com.easyops.sales.controller;

import com.easyops.sales.dto.CustomerRequest;
import com.easyops.sales.entity.Customer;
import com.easyops.sales.service.CustomerService;
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
@RequestMapping("/api/sales/customers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sales Customers", description = "Customer management for Sales")
public class CustomerController {
    
    private final CustomerService customerService;
    
    @GetMapping
    @Operation(summary = "Get all customers for an organization")
    public ResponseEntity<List<Customer>> getAllCustomers(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam(value = "activeOnly", required = false, defaultValue = "false") boolean activeOnly) {
        
        log.info("GET /api/sales/customers - organizationId: {}, activeOnly: {}", organizationId, activeOnly);
        
        List<Customer> customers = activeOnly 
                ? customerService.getActiveCustomers(organizationId)
                : customerService.getAllCustomers(organizationId);
        
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<Customer> getCustomerById(@PathVariable("id") UUID id) {
        log.info("GET /api/sales/customers/{}", id);
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new customer")
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerRequest request) {
        log.info("POST /api/sales/customers - Creating customer for organization: {}", request.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update customer")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CustomerRequest request) {
        log.info("PUT /api/sales/customers/{}", id);
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable("id") UUID id) {
        log.info("DELETE /api/sales/customers/{}", id);
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate customer")
    public ResponseEntity<Customer> deactivateCustomer(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/customers/{}/deactivate", id);
        return ResponseEntity.ok(customerService.deactivateCustomer(id));
    }
}

