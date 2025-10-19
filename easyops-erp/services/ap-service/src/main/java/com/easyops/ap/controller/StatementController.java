package com.easyops.ap.controller;

import com.easyops.ap.dto.VendorStatementResponse;
import com.easyops.ap.service.StatementService;
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
@RequestMapping("/api/ap/statements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AP Statements", description = "Vendor statement generation for Accounts Payable")
public class StatementController {
    
    private final StatementService statementService;
    
    @GetMapping("/vendor/{vendorId}")
    @Operation(summary = "Generate vendor statement for a date range")
    public ResponseEntity<VendorStatementResponse> getVendorStatement(
            @PathVariable UUID vendorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/ap/statements/vendor/{} - startDate: {}, endDate: {}", vendorId, startDate, endDate);
        
        VendorStatementResponse statement = statementService.generateVendorStatement(vendorId, startDate, endDate);
        return ResponseEntity.ok(statement);
    }
    
    @PostMapping("/vendor/{vendorId}/email")
    @Operation(summary = "Email vendor statement")
    public ResponseEntity<String> emailVendorStatement(
            @PathVariable UUID vendorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("POST /api/ap/statements/vendor/{}/email - startDate: {}, endDate: {}", vendorId, startDate, endDate);
        
        statementService.emailStatement(vendorId, startDate, endDate);
        return ResponseEntity.ok("Statement emailed successfully");
    }
}

