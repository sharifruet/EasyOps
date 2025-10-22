package com.easyops.inventory.service;

import com.easyops.inventory.entity.Product;
import com.easyops.inventory.entity.Stock;
import com.easyops.inventory.repository.ProductRepository;
import com.easyops.inventory.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryAccountingService {
    
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final InventoryValuationService valuationService;
    
    /**
     * Create GL journal entry for stock receipt
     */
    @Transactional
    public Map<String, Object> createReceiptJournalEntry(
            UUID organizationId, UUID productId, UUID warehouseId,
            BigDecimal quantity, BigDecimal unitCost, LocalDate transactionDate) {
        
        log.info("Creating GL entry for stock receipt - product: {}, qty: {}, cost: {}", 
                 productId, quantity, unitCost);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        BigDecimal totalCost = quantity.multiply(unitCost);
        
        // Dr: Inventory Asset Account
        // Cr: Accounts Payable (or Cash, depending on payment terms)
        
        Map<String, Object> journalEntry = new HashMap<>();
        journalEntry.put("organizationId", organizationId);
        journalEntry.put("journalDate", transactionDate);
        journalEntry.put("journalType", "INVENTORY_RECEIPT");
        journalEntry.put("description", "Stock receipt for product: " + product.getName());
        journalEntry.put("sourceType", "PURCHASE_ORDER");
        journalEntry.put("sourceId", productId);
        
        // Journal lines
        Map<String, Object> debitLine = new HashMap<>();
        debitLine.put("accountId", product.getInventoryGlAccountId());
        debitLine.put("debitAmount", totalCost);
        debitLine.put("creditAmount", BigDecimal.ZERO);
        debitLine.put("description", "Inventory receipt - " + product.getName());
        
        Map<String, Object> creditLine = new HashMap<>();
        creditLine.put("accountId", null); // AP account - would come from PO
        creditLine.put("debitAmount", BigDecimal.ZERO);
        creditLine.put("creditAmount", totalCost);
        creditLine.put("description", "Inventory receipt - " + product.getName());
        
        journalEntry.put("lines", List.of(debitLine, creditLine));
        journalEntry.put("totalDebit", totalCost);
        journalEntry.put("totalCredit", totalCost);
        
        // TODO: Call accounting-service to post this journal entry
        
        log.info("GL entry created for stock receipt. Amount: {}", totalCost);
        return journalEntry;
    }
    
    /**
     * Create GL journal entry for COGS when stock is issued
     */
    @Transactional
    public Map<String, Object> createCOGSJournalEntry(
            UUID organizationId, UUID productId, UUID warehouseId,
            BigDecimal quantity, String valuationMethod, LocalDate transactionDate,
            UUID salesOrderId) {
        
        log.info("Creating COGS GL entry - product: {}, qty: {}, method: {}", 
                 productId, quantity, valuationMethod);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Calculate COGS based on valuation method
        BigDecimal cogsAmount;
        switch (valuationMethod != null ? valuationMethod.toUpperCase() : "WEIGHTED_AVERAGE") {
            case "FIFO":
                cogsAmount = valuationService.calculateCOGS_FIFO(productId, warehouseId, quantity, transactionDate);
                break;
            case "LIFO":
                cogsAmount = valuationService.calculateCOGS_LIFO(productId, warehouseId, quantity, transactionDate);
                break;
            default: // WEIGHTED_AVERAGE
                cogsAmount = valuationService.calculateCOGS_WeightedAverage(productId, warehouseId, quantity);
        }
        
        // Dr: COGS Account
        // Cr: Inventory Asset Account
        
        Map<String, Object> journalEntry = new HashMap<>();
        journalEntry.put("organizationId", organizationId);
        journalEntry.put("journalDate", transactionDate);
        journalEntry.put("journalType", "COGS");
        journalEntry.put("description", "COGS for sale of product: " + product.getName());
        journalEntry.put("sourceType", "SALES_ORDER");
        journalEntry.put("sourceId", salesOrderId);
        
        // Journal lines
        Map<String, Object> debitLine = new HashMap<>();
        debitLine.put("accountId", product.getCogsGlAccountId());
        debitLine.put("debitAmount", cogsAmount);
        debitLine.put("creditAmount", BigDecimal.ZERO);
        debitLine.put("description", "COGS - " + product.getName());
        
        Map<String, Object> creditLine = new HashMap<>();
        creditLine.put("accountId", product.getInventoryGlAccountId());
        creditLine.put("debitAmount", BigDecimal.ZERO);
        creditLine.put("creditAmount", cogsAmount);
        creditLine.put("description", "Inventory reduction - " + product.getName());
        
        journalEntry.put("lines", List.of(debitLine, creditLine));
        journalEntry.put("totalDebit", cogsAmount);
        journalEntry.put("totalCredit", cogsAmount);
        
        // TODO: Call accounting-service to post this journal entry
        
        log.info("COGS GL entry created. Amount: {}", cogsAmount);
        return journalEntry;
    }
    
    /**
     * Create GL entry for inventory adjustment
     */
    @Transactional
    public Map<String, Object> createAdjustmentJournalEntry(
            UUID organizationId, UUID productId, BigDecimal adjustmentQuantity,
            BigDecimal unitCost, String reason, LocalDate transactionDate) {
        
        log.info("Creating GL entry for inventory adjustment - product: {}, qty: {}", 
                 productId, adjustmentQuantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        BigDecimal adjustmentValue = adjustmentQuantity.multiply(unitCost);
        
        Map<String, Object> journalEntry = new HashMap<>();
        journalEntry.put("organizationId", organizationId);
        journalEntry.put("journalDate", transactionDate);
        journalEntry.put("journalType", "INVENTORY_ADJUSTMENT");
        journalEntry.put("description", "Inventory adjustment - " + reason);
        journalEntry.put("sourceType", "STOCK_ADJUSTMENT");
        journalEntry.put("sourceId", productId);
        
        // If positive adjustment: Dr Inventory, Cr Adjustment Income
        // If negative adjustment: Dr Adjustment Expense, Cr Inventory
        
        Map<String, Object> line1 = new HashMap<>();
        Map<String, Object> line2 = new HashMap<>();
        
        if (adjustmentQuantity.compareTo(BigDecimal.ZERO) > 0) {
            // Positive adjustment
            line1.put("accountId", product.getInventoryGlAccountId());
            line1.put("debitAmount", adjustmentValue.abs());
            line1.put("creditAmount", BigDecimal.ZERO);
            
            line2.put("accountId", null); // Adjustment income account
            line2.put("debitAmount", BigDecimal.ZERO);
            line2.put("creditAmount", adjustmentValue.abs());
        } else {
            // Negative adjustment
            line1.put("accountId", null); // Adjustment expense account
            line1.put("debitAmount", adjustmentValue.abs());
            line1.put("creditAmount", BigDecimal.ZERO);
            
            line2.put("accountId", product.getInventoryGlAccountId());
            line2.put("debitAmount", BigDecimal.ZERO);
            line2.put("creditAmount", adjustmentValue.abs());
        }
        
        journalEntry.put("lines", List.of(line1, line2));
        journalEntry.put("totalDebit", adjustmentValue.abs());
        journalEntry.put("totalCredit", adjustmentValue.abs());
        
        // TODO: Call accounting-service to post this journal entry
        
        log.info("Adjustment GL entry created. Amount: {}", adjustmentValue);
        return journalEntry;
    }
}

