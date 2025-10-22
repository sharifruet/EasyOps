package com.easyops.inventory.controller;

import com.easyops.inventory.entity.StockTransfer;
import com.easyops.inventory.service.StockTransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/transfers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Transfers", description = "Inter-warehouse stock transfer APIs")
@CrossOrigin(origins = "*")
public class StockTransferController {
    
    private final StockTransferService transferService;
    
    @GetMapping
    @Operation(summary = "Get all stock transfers")
    public ResponseEntity<List<StockTransfer>> getAllTransfers(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean pendingOnly) {
        log.info("GET /api/inventory/transfers - org: {}, status: {}, pendingOnly: {}", 
                 organizationId, status, pendingOnly);
        
        List<StockTransfer> transfers;
        if (Boolean.TRUE.equals(pendingOnly)) {
            transfers = transferService.getPendingTransfers(organizationId);
        } else if (status != null) {
            transfers = transferService.getTransfersByStatus(organizationId, status);
        } else {
            transfers = transferService.getAllTransfers(organizationId);
        }
        
        return ResponseEntity.ok(transfers);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get transfer by ID with lines")
    public ResponseEntity<StockTransfer> getTransferById(@PathVariable UUID id) {
        log.info("GET /api/inventory/transfers/{}", id);
        StockTransfer transfer = transferService.getTransferById(id);
        return ResponseEntity.ok(transfer);
    }
    
    @PostMapping
    @Operation(summary = "Create new stock transfer")
    public ResponseEntity<StockTransfer> createTransfer(@Valid @RequestBody StockTransfer transfer) {
        log.info("POST /api/inventory/transfers - from: {} to: {}", 
                 transfer.getFromWarehouseId(), transfer.getToWarehouseId());
        StockTransfer created = transferService.createTransfer(transfer);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit transfer for approval")
    public ResponseEntity<StockTransfer> submitTransfer(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/transfers/{}/submit", id);
        
        UUID userId = UUID.fromString(request.get("userId").toString());
        StockTransfer transfer = transferService.submitForApproval(id, userId);
        
        return ResponseEntity.ok(transfer);
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve stock transfer")
    public ResponseEntity<StockTransfer> approveTransfer(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/transfers/{}/approve", id);
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy").toString());
        StockTransfer transfer = transferService.approveTransfer(id, approvedBy);
        
        return ResponseEntity.ok(transfer);
    }
    
    @PostMapping("/{id}/ship")
    @Operation(summary = "Ship stock transfer")
    public ResponseEntity<StockTransfer> shipTransfer(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/transfers/{}/ship", id);
        
        UUID shippedBy = UUID.fromString(request.get("shippedBy").toString());
        String trackingNumber = request.containsKey("trackingNumber") 
            ? request.get("trackingNumber").toString() 
            : null;
        
        StockTransfer transfer = transferService.shipTransfer(id, shippedBy, trackingNumber);
        
        return ResponseEntity.ok(transfer);
    }
    
    @PostMapping("/{id}/receive")
    @Operation(summary = "Receive stock transfer at destination")
    public ResponseEntity<StockTransfer> receiveTransfer(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/transfers/{}/receive", id);
        
        UUID receivedBy = UUID.fromString(request.get("receivedBy").toString());
        StockTransfer transfer = transferService.receiveTransfer(id, receivedBy);
        
        return ResponseEntity.ok(transfer);
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel stock transfer")
    public ResponseEntity<StockTransfer> cancelTransfer(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> request) {
        log.info("POST /api/inventory/transfers/{}/cancel", id);
        
        String reason = request != null && request.containsKey("reason") 
            ? request.get("reason").toString() 
            : "Cancelled by user";
        
        StockTransfer transfer = transferService.cancelTransfer(id, reason);
        
        return ResponseEntity.ok(transfer);
    }
}

