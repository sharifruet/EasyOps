package com.easyops.ap.controller;

import com.easyops.ap.dto.BillRequest;
import com.easyops.ap.entity.APBill;
import com.easyops.ap.service.BillService;
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
@RequestMapping("/api/ap/bills")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AP Bills", description = "Bill management for Accounts Payable")
public class BillController {
    private final BillService billService;
    
    @GetMapping
    @Operation(summary = "Get all bills for an organization")
    public ResponseEntity<List<APBill>> getAllBills(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        List<APBill> bills = status != null 
                ? billService.getBillsByStatus(organizationId, status)
                : billService.getAllBills(organizationId);
        return ResponseEntity.ok(bills);
    }
    
    @GetMapping("/outstanding")
    @Operation(summary = "Get outstanding bills")
    public ResponseEntity<List<APBill>> getOutstandingBills(@RequestParam UUID organizationId) {
        return ResponseEntity.ok(billService.getOutstandingBills(organizationId));
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue bills")
    public ResponseEntity<List<APBill>> getOverdueBills(@RequestParam UUID organizationId) {
        return ResponseEntity.ok(billService.getOverdueBills(organizationId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID")
    public ResponseEntity<APBill> getBillById(@PathVariable UUID id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new bill")
    public ResponseEntity<APBill> createBill(@Valid @RequestBody BillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billService.createBill(request));
    }
    
    @PostMapping("/{id}/post")
    @Operation(summary = "Post bill")
    public ResponseEntity<APBill> postBill(@PathVariable UUID id) {
        return ResponseEntity.ok(billService.postBill(id));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bill")
    public ResponseEntity<Void> deleteBill(@PathVariable UUID id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}

