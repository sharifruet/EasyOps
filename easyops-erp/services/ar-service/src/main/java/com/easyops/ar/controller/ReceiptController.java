package com.easyops.ar.controller;

import com.easyops.ar.dto.ReceiptRequest;
import com.easyops.ar.entity.ARReceipt;
import com.easyops.ar.service.ReceiptService;
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
@RequestMapping("/api/ar/receipts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AR Receipts", description = "Receipt management for Accounts Receivable")
public class ReceiptController {
    
    private final ReceiptService receiptService;
    
    @GetMapping
    @Operation(summary = "Get all receipts for an organization")
    public ResponseEntity<List<ARReceipt>> getAllReceipts(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /api/ar/receipts - organizationId: {}, status: {}", organizationId, status);
        
        List<ARReceipt> receipts = status != null 
                ? receiptService.getReceiptsByStatus(organizationId, status)
                : receiptService.getAllReceipts(organizationId);
        
        return ResponseEntity.ok(receipts);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get receipt by ID")
    public ResponseEntity<ARReceipt> getReceiptById(@PathVariable UUID id) {
        log.info("GET /api/ar/receipts/{}", id);
        ARReceipt receipt = receiptService.getReceiptById(id);
        return ResponseEntity.ok(receipt);
    }
    
    @PostMapping
    @Operation(summary = "Create new receipt")
    public ResponseEntity<ARReceipt> createReceipt(@Valid @RequestBody ReceiptRequest request) {
        log.info("POST /api/ar/receipts - Creating receipt: {}", request.getReceiptNumber());
        ARReceipt receipt = receiptService.createReceipt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
    }
    
    @PostMapping("/{id}/post")
    @Operation(summary = "Post receipt (change status from DRAFT to POSTED)")
    public ResponseEntity<ARReceipt> postReceipt(@PathVariable UUID id) {
        log.info("POST /api/ar/receipts/{}/post", id);
        ARReceipt receipt = receiptService.postReceipt(id);
        return ResponseEntity.ok(receipt);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete receipt")
    public ResponseEntity<Void> deleteReceipt(@PathVariable UUID id) {
        log.info("DELETE /api/ar/receipts/{}", id);
        receiptService.deleteReceipt(id);
        return ResponseEntity.noContent().build();
    }
}

