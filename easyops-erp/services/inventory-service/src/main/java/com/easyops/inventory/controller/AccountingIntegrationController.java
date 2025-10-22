package com.easyops.inventory.controller;

import com.easyops.inventory.service.InventoryAccountingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/accounting")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Accounting Integration", description = "GL and COGS integration APIs")
@CrossOrigin(origins = "*")
public class AccountingIntegrationController {
    
    private final InventoryAccountingService accountingService;
    
    @PostMapping("/cogs")
    @Operation(summary = "Generate COGS journal entry for stock issue")
    public ResponseEntity<Map<String, Object>> generateCOGSEntry(@RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/accounting/cogs");
        
        UUID organizationId = UUID.fromString(request.get("organizationId").toString());
        UUID productId = UUID.fromString(request.get("productId").toString());
        UUID warehouseId = UUID.fromString(request.get("warehouseId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        String valuationMethod = request.getOrDefault("valuationMethod", "WEIGHTED_AVERAGE").toString();
        LocalDate transactionDate = request.containsKey("transactionDate") 
            ? LocalDate.parse(request.get("transactionDate").toString())
            : LocalDate.now();
        UUID salesOrderId = request.containsKey("salesOrderId") 
            ? UUID.fromString(request.get("salesOrderId").toString())
            : null;
        
        Map<String, Object> journalEntry = accountingService.createCOGSJournalEntry(
            organizationId, productId, warehouseId, quantity, valuationMethod, transactionDate, salesOrderId);
        
        return ResponseEntity.ok(journalEntry);
    }
    
    @PostMapping("/receipt")
    @Operation(summary = "Generate GL entry for stock receipt")
    public ResponseEntity<Map<String, Object>> generateReceiptEntry(@RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/accounting/receipt");
        
        UUID organizationId = UUID.fromString(request.get("organizationId").toString());
        UUID productId = UUID.fromString(request.get("productId").toString());
        UUID warehouseId = UUID.fromString(request.get("warehouseId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal unitCost = new BigDecimal(request.get("unitCost").toString());
        LocalDate transactionDate = request.containsKey("transactionDate") 
            ? LocalDate.parse(request.get("transactionDate").toString())
            : LocalDate.now();
        
        Map<String, Object> journalEntry = accountingService.createReceiptJournalEntry(
            organizationId, productId, warehouseId, quantity, unitCost, transactionDate);
        
        return ResponseEntity.ok(journalEntry);
    }
}

