package com.easyops.bank.controller;

import com.easyops.bank.dto.BankAccountRequest;
import com.easyops.bank.entity.BankAccount;
import com.easyops.bank.service.BankAccountService;
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
@RequestMapping("/api/bank/accounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bank Accounts", description = "Bank account management")
public class BankAccountController {
    private final BankAccountService bankAccountService;
    
    @GetMapping
    @Operation(summary = "Get all bank accounts")
    public ResponseEntity<List<BankAccount>> getAllAccounts(
            @RequestParam UUID organizationId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<BankAccount> accounts = activeOnly 
                ? bankAccountService.getActiveAccounts(organizationId)
                : bankAccountService.getAllAccounts(organizationId);
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get bank account by ID")
    public ResponseEntity<BankAccount> getAccountById(@PathVariable UUID id) {
        return ResponseEntity.ok(bankAccountService.getAccountById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new bank account")
    public ResponseEntity<BankAccount> createAccount(@Valid @RequestBody BankAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bankAccountService.createAccount(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update bank account")
    public ResponseEntity<BankAccount> updateAccount(@PathVariable UUID id, @Valid @RequestBody BankAccountRequest request) {
        return ResponseEntity.ok(bankAccountService.updateAccount(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bank account")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        bankAccountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}

