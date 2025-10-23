package com.easyops.inventory.controller;

import com.easyops.inventory.entity.BatchLot;
import com.easyops.inventory.service.BatchLotService;
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
@RequestMapping("/api/inventory/batches")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Batch/Lot Tracking", description = "Batch and lot management APIs")
@CrossOrigin(origins = "*")
public class BatchLotController {
    
    private final BatchLotService batchLotService;
    
    @GetMapping
    @Operation(summary = "Get all batches")
    public ResponseEntity<List<BatchLot>> getAllBatches(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID productId) {
        log.info("GET /api/inventory/batches - org: {}, product: {}", organizationId, productId);
        
        List<BatchLot> batches = productId != null
            ? batchLotService.getBatchesByProduct(organizationId, productId)
            : batchLotService.getAllBatches(organizationId);
        
        return ResponseEntity.ok(batches);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get batch by ID")
    public ResponseEntity<BatchLot> getBatchById(@PathVariable UUID id) {
        log.info("GET /api/inventory/batches/{}", id);
        BatchLot batch = batchLotService.getBatchById(id);
        return ResponseEntity.ok(batch);
    }
    
    @GetMapping("/expiring")
    @Operation(summary = "Get expiring batches")
    public ResponseEntity<List<BatchLot>> getExpiringBatches(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
        log.info("GET /api/inventory/batches/expiring - org: {}, before: {}", organizationId, beforeDate);
        
        LocalDate date = beforeDate != null ? beforeDate : LocalDate.now().plusDays(30);
        List<BatchLot> batches = batchLotService.getExpiringBatches(organizationId, date);
        
        return ResponseEntity.ok(batches);
    }
    
    @GetMapping("/expired")
    @Operation(summary = "Get expired batches")
    public ResponseEntity<List<BatchLot>> getExpiredBatches(@RequestParam UUID organizationId) {
        log.info("GET /api/inventory/batches/expired - org: {}", organizationId);
        List<BatchLot> batches = batchLotService.getExpiredBatches(organizationId);
        return ResponseEntity.ok(batches);
    }
    
    @PostMapping
    @Operation(summary = "Create new batch")
    public ResponseEntity<BatchLot> createBatch(@Valid @RequestBody BatchLot batch) {
        log.info("POST /api/inventory/batches - batch: {}", batch.getBatchNumber());
        BatchLot createdBatch = batchLotService.createBatch(batch);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBatch);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update batch")
    public ResponseEntity<BatchLot> updateBatch(
            @PathVariable UUID id,
            @Valid @RequestBody BatchLot batch) {
        log.info("PUT /api/inventory/batches/{} - batch: {}", id, batch.getBatchNumber());
        BatchLot updatedBatch = batchLotService.updateBatch(id, batch);
        return ResponseEntity.ok(updatedBatch);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update batch status")
    public ResponseEntity<BatchLot> updateBatchStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        log.info("PUT /api/inventory/batches/{}/status - status: {}", id, status);
        BatchLot batch = batchLotService.updateBatchStatus(id, status);
        return ResponseEntity.ok(batch);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete batch")
    public ResponseEntity<Void> deleteBatch(@PathVariable UUID id) {
        log.info("DELETE /api/inventory/batches/{}", id);
        batchLotService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }
}

