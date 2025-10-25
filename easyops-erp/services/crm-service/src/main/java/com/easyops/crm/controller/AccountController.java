package com.easyops.crm.controller;

import com.easyops.crm.entity.Account;
import com.easyops.crm.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/crm/accounts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AccountController {
    
    private final AccountService accountService;
    
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String accountType,
            @RequestParam(required = false) String search) {
        
        log.info("GET /api/crm/accounts - organizationId: {}", organizationId);
        
        List<Account> accounts;
        
        if (search != null && !search.isEmpty()) {
            accounts = accountService.searchAccounts(organizationId, search);
        } else if (accountType != null) {
            accounts = accountService.getAccountsByType(organizationId, accountType);
        } else {
            accounts = accountService.getAllAccounts(organizationId);
        }
        
        return ResponseEntity.ok(accounts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable UUID id) {
        log.info("GET /api/crm/accounts/{}", id);
        Account account = accountService.getAccountById(id);
        return ResponseEntity.ok(account);
    }
    
    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        log.info("POST /api/crm/accounts - Creating account");
        Account created = accountService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable UUID id, @RequestBody Account account) {
        log.info("PUT /api/crm/accounts/{}", id);
        Account updated = accountService.updateAccount(id, account);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        log.info("DELETE /api/crm/accounts/{}", id);
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}


