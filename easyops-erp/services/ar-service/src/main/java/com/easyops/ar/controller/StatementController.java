package com.easyops.ar.controller;

import com.easyops.ar.dto.CustomerStatementResponse;
import com.easyops.ar.service.StatementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/ar/statements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AR Statements", description = "Customer statement generation for Accounts Receivable")
public class StatementController {
    
    private final StatementService statementService;
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Generate customer statement for a date range")
    public ResponseEntity<CustomerStatementResponse> getCustomerStatement(
            @PathVariable UUID customerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/ar/statements/customer/{} - startDate: {}, endDate: {}", customerId, startDate, endDate);
        
        CustomerStatementResponse statement = statementService.generateCustomerStatement(customerId, startDate, endDate);
        return ResponseEntity.ok(statement);
    }
    
    @PostMapping("/customer/{customerId}/email")
    @Operation(summary = "Email customer statement")
    public ResponseEntity<String> emailCustomerStatement(
            @PathVariable UUID customerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("POST /api/ar/statements/customer/{}/email - startDate: {}, endDate: {}", customerId, startDate, endDate);
        
        statementService.emailStatement(customerId, startDate, endDate);
        return ResponseEntity.ok("Statement emailed successfully");
    }
}

