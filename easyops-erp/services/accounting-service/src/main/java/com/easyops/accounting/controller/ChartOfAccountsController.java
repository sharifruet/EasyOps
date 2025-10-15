package com.easyops.accounting.controller;

import com.easyops.accounting.dto.CoARequest;
import com.easyops.accounting.entity.ChartOfAccounts;
import com.easyops.accounting.service.ChartOfAccountsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/coa")
@RequiredArgsConstructor
@Tag(name = "Chart of Accounts", description = "Chart of Accounts management")
public class ChartOfAccountsController {
    
    private final ChartOfAccountsService coaService;
    
    @PostMapping
    @Operation(summary = "Create a new account")
    public ResponseEntity<ChartOfAccounts> createAccount(
            @Valid @RequestBody CoARequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID createdBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(coaService.createAccount(request, createdBy));
    }
    
    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get all accounts for organization")
    public ResponseEntity<List<ChartOfAccounts>> getOrganizationAccounts(
            @PathVariable UUID organizationId) {
        return ResponseEntity.ok(coaService.getOrganizationAccounts(organizationId));
    }
    
    @GetMapping("/organization/{organizationId}/active")
    @Operation(summary = "Get active accounts for organization")
    public ResponseEntity<List<ChartOfAccounts>> getActiveAccounts(
            @PathVariable UUID organizationId) {
        return ResponseEntity.ok(coaService.getActiveAccounts(organizationId));
    }
    
    @GetMapping("/organization/{organizationId}/posting")
    @Operation(summary = "Get posting accounts (non-group accounts)")
    public ResponseEntity<List<ChartOfAccounts>> getPostingAccounts(
            @PathVariable UUID organizationId) {
        return ResponseEntity.ok(coaService.getPostingAccounts(organizationId));
    }
    
    @GetMapping("/organization/{organizationId}/type/{accountType}")
    @Operation(summary = "Get accounts by type")
    public ResponseEntity<List<ChartOfAccounts>> getAccountsByType(
            @PathVariable UUID organizationId,
            @PathVariable String accountType) {
        return ResponseEntity.ok(coaService.getAccountsByType(organizationId, accountType));
    }
    
    @GetMapping("/{accountId}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<ChartOfAccounts> getAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(coaService.getAccountById(accountId));
    }
    
    @PutMapping("/{accountId}")
    @Operation(summary = "Update account")
    public ResponseEntity<ChartOfAccounts> updateAccount(
            @PathVariable UUID accountId,
            @Valid @RequestBody CoARequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID updatedBy) {
        return ResponseEntity.ok(coaService.updateAccount(accountId, request, updatedBy));
    }
    
    @DeleteMapping("/{accountId}")
    @Operation(summary = "Deactivate account")
    public ResponseEntity<Void> deactivateAccount(
            @PathVariable UUID accountId,
            @RequestParam UUID organizationId) {
        coaService.deactivateAccount(accountId, organizationId);
        return ResponseEntity.noContent().build();
    }
}

