package com.easyops.bank.controller;

import com.easyops.bank.dto.TransactionRequest;
import com.easyops.bank.entity.BankTransaction;
import com.easyops.bank.service.BankTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bank/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bank Transactions", description = "Bank transaction management")
public class BankTransactionController {
    private final BankTransactionService transactionService;
    
    @GetMapping
    @Operation(summary = "Get transactions by account")
    public ResponseEntity<List<BankTransaction>> getTransactionsByAccount(
            @RequestParam UUID accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByDateRange(accountId, startDate, endDate));
        }
        return ResponseEntity.ok(transactionService.getTransactionsByAccount(accountId));
    }
    
    @GetMapping("/unreconciled")
    @Operation(summary = "Get unreconciled transactions")
    public ResponseEntity<List<BankTransaction>> getUnreconciledTransactions(@RequestParam UUID accountId) {
        return ResponseEntity.ok(transactionService.getUnreconciledTransactions(accountId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<BankTransaction> getTransactionById(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new transaction")
    public ResponseEntity<BankTransaction> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}

