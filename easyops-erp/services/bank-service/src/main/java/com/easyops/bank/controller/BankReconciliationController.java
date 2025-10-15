package com.easyops.bank.controller;

import com.easyops.bank.dto.ReconciliationRequest;
import com.easyops.bank.entity.BankReconciliation;
import com.easyops.bank.service.BankReconciliationService;
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
@RequestMapping("/api/bank/reconciliations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bank Reconciliations", description = "Bank reconciliation management")
public class BankReconciliationController {
    private final BankReconciliationService reconciliationService;
    
    @GetMapping
    @Operation(summary = "Get reconciliations by account")
    public ResponseEntity<List<BankReconciliation>> getReconciliationsByAccount(@RequestParam UUID accountId) {
        return ResponseEntity.ok(reconciliationService.getReconciliationsByAccount(accountId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get reconciliation by ID")
    public ResponseEntity<BankReconciliation> getReconciliationById(@PathVariable UUID id) {
        return ResponseEntity.ok(reconciliationService.getReconciliationById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new reconciliation")
    public ResponseEntity<BankReconciliation> createReconciliation(@Valid @RequestBody ReconciliationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reconciliationService.createReconciliation(request));
    }
    
    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete reconciliation")
    public ResponseEntity<BankReconciliation> completeReconciliation(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(reconciliationService.completeReconciliation(id, userId));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete reconciliation")
    public ResponseEntity<Void> deleteReconciliation(@PathVariable UUID id) {
        reconciliationService.deleteReconciliation(id);
        return ResponseEntity.noContent().build();
    }
}

