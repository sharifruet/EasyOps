package com.easyops.inventory.service;

import com.easyops.inventory.entity.Stock;
import com.easyops.inventory.entity.StockMovement;
import com.easyops.inventory.repository.StockRepository;
import com.easyops.inventory.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {
    
    private final StockRepository stockRepository;
    private final StockMovementRepository movementRepository;
    
    @Transactional(readOnly = true)
    public List<Stock> getStockByOrganization(UUID organizationId) {
        log.debug("Fetching stock for organization: {}", organizationId);
        return stockRepository.findByOrganizationId(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Stock> getStockByProduct(UUID organizationId, UUID productId) {
        log.debug("Fetching stock for product: {}", productId);
        return stockRepository.findByOrganizationIdAndProductId(organizationId, productId);
    }
    
    @Transactional(readOnly = true)
    public List<Stock> getStockByWarehouse(UUID organizationId, UUID warehouseId) {
        log.debug("Fetching stock for warehouse: {}", warehouseId);
        return stockRepository.findByOrganizationIdAndWarehouseId(organizationId, warehouseId);
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getAvailableQuantity(UUID productId, UUID warehouseId) {
        log.debug("Getting available quantity for product: {} in warehouse: {}", productId, warehouseId);
        return stockRepository.getTotalAvailableQuantity(productId, warehouseId);
    }
    
    @Transactional(readOnly = true)
    public List<Stock> getLowStockItems(UUID organizationId) {
        log.debug("Fetching low stock items for organization: {}", organizationId);
        return stockRepository.findItemsAtReorderPoint(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Stock> getOutOfStockItems(UUID organizationId) {
        log.debug("Fetching out of stock items for organization: {}", organizationId);
        return stockRepository.findOutOfStockItems(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Stock> getExpiringStock(UUID organizationId, LocalDate beforeDate) {
        log.debug("Fetching expiring stock before: {}", beforeDate);
        return stockRepository.findExpiringStock(organizationId, beforeDate);
    }
    
    /**
     * Receive stock - increases on-hand quantity
     */
    @Transactional
    public Stock receiveStock(UUID organizationId, UUID productId, UUID warehouseId, 
                              BigDecimal quantity, BigDecimal unitCost, String sourceType, 
                              UUID sourceId, UUID createdBy) {
        log.info("Receiving stock: product={}, warehouse={}, qty={}", productId, warehouseId, quantity);
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        
        // Find or create stock record
        Stock stock = stockRepository.findMainStock(organizationId, productId, warehouseId)
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setOrganizationId(organizationId);
                    newStock.setProductId(productId);
                    newStock.setWarehouseId(warehouseId);
                    newStock.setQuantityOnHand(BigDecimal.ZERO);
                    newStock.setQuantityAllocated(BigDecimal.ZERO);
                    newStock.setQuantityAvailable(BigDecimal.ZERO);
                    newStock.setUnitCost(unitCost);
                    return newStock;
                });
        
        // Update quantities
        stock.setQuantityOnHand(stock.getQuantityOnHand().add(quantity));
        stock.setQuantityAvailable(stock.getQuantityOnHand().subtract(stock.getQuantityAllocated()));
        
        // Update cost (weighted average)
        if (stock.getQuantityOnHand().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalValue = stock.getTotalCost().add(quantity.multiply(unitCost));
            stock.setUnitCost(totalValue.divide(stock.getQuantityOnHand(), 4, BigDecimal.ROUND_HALF_UP));
            stock.setTotalCost(stock.getQuantityOnHand().multiply(stock.getUnitCost()));
        }
        
        stock.setLastMovementAt(LocalDateTime.now());
        
        Stock savedStock = stockRepository.save(stock);
        
        // Create movement record
        createMovement(organizationId, productId, warehouseId, null, "RECEIPT", quantity,
                      unitCost, sourceType, sourceId, null, createdBy);
        
        return savedStock;
    }
    
    /**
     * Issue stock - decreases on-hand quantity (for sales, production, etc.)
     */
    @Transactional
    public Stock issueStock(UUID organizationId, UUID productId, UUID warehouseId,
                           BigDecimal quantity, String sourceType, UUID sourceId, UUID createdBy) {
        log.info("Issuing stock: product={}, warehouse={}, qty={}", productId, warehouseId, quantity);
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        
        Stock stock = stockRepository.findMainStock(organizationId, productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        if (stock.getQuantityAvailable().compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock available. Available: " + stock.getQuantityAvailable() + ", Requested: " + quantity);
        }
        
        // Update quantities
        stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(quantity));
        stock.setQuantityAvailable(stock.getQuantityOnHand().subtract(stock.getQuantityAllocated()));
        stock.setTotalCost(stock.getQuantityOnHand().multiply(stock.getUnitCost()));
        stock.setLastMovementAt(LocalDateTime.now());
        
        Stock savedStock = stockRepository.save(stock);
        
        // Create movement record
        createMovement(organizationId, productId, warehouseId, null, "ISSUE", quantity.negate(),
                      stock.getUnitCost(), sourceType, sourceId, null, createdBy);
        
        return savedStock;
    }
    
    /**
     * Allocate stock - reserves stock for sales orders
     */
    @Transactional
    public Stock allocateStock(UUID organizationId, UUID productId, UUID warehouseId,
                              BigDecimal quantity, UUID salesOrderId, UUID createdBy) {
        log.info("Allocating stock: product={}, warehouse={}, qty={}", productId, warehouseId, quantity);
        
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        
        Stock stock = stockRepository.findMainStock(organizationId, productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        if (stock.getQuantityAvailable().compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock available for allocation. Available: " + stock.getQuantityAvailable() + ", Requested: " + quantity);
        }
        
        // Allocate stock
        stock.setQuantityAllocated(stock.getQuantityAllocated().add(quantity));
        stock.setQuantityAvailable(stock.getQuantityOnHand().subtract(stock.getQuantityAllocated()));
        stock.setLastMovementAt(LocalDateTime.now());
        
        return stockRepository.save(stock);
    }
    
    /**
     * Deallocate stock - releases reserved stock
     */
    @Transactional
    public Stock deallocateStock(UUID organizationId, UUID productId, UUID warehouseId,
                                BigDecimal quantity, UUID salesOrderId, UUID createdBy) {
        log.info("Deallocating stock: product={}, warehouse={}, qty={}", productId, warehouseId, quantity);
        
        Stock stock = stockRepository.findMainStock(organizationId, productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        stock.setQuantityAllocated(stock.getQuantityAllocated().subtract(quantity));
        stock.setQuantityAvailable(stock.getQuantityOnHand().subtract(stock.getQuantityAllocated()));
        stock.setLastMovementAt(LocalDateTime.now());
        
        return stockRepository.save(stock);
    }
    
    /**
     * Adjust stock - manual stock adjustment (increase or decrease)
     */
    @Transactional
    public Stock adjustStock(UUID organizationId, UUID productId, UUID warehouseId,
                            BigDecimal newQuantity, String reason, UUID createdBy) {
        log.info("Adjusting stock: product={}, warehouse={}, new qty={}", productId, warehouseId, newQuantity);
        
        Stock stock = stockRepository.findMainStock(organizationId, productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        
        BigDecimal oldQuantity = stock.getQuantityOnHand();
        BigDecimal adjustmentQty = newQuantity.subtract(oldQuantity);
        
        stock.setQuantityOnHand(newQuantity);
        stock.setQuantityAvailable(stock.getQuantityOnHand().subtract(stock.getQuantityAllocated()));
        stock.setTotalCost(stock.getQuantityOnHand().multiply(stock.getUnitCost()));
        stock.setLastMovementAt(LocalDateTime.now());
        
        Stock savedStock = stockRepository.save(stock);
        
        // Create movement record
        createMovement(organizationId, productId, warehouseId, null, "ADJUSTMENT", adjustmentQty,
                      stock.getUnitCost(), "MANUAL", null, reason, createdBy);
        
        return savedStock;
    }
    
    /**
     * Helper method to create stock movement records
     */
    private void createMovement(UUID organizationId, UUID productId, UUID warehouseId,
                               UUID locationId, String transactionType, BigDecimal quantity,
                               BigDecimal unitCost, String sourceType, UUID sourceId,
                               String reason, UUID createdBy) {
        
        StockMovement movement = new StockMovement();
        movement.setOrganizationId(organizationId);
        movement.setTransactionNumber(generateTransactionNumber(transactionType));
        movement.setTransactionDate(LocalDate.now());
        movement.setTransactionType(transactionType);
        movement.setProductId(productId);
        movement.setWarehouseId(warehouseId);
        movement.setLocationId(locationId);
        movement.setQuantity(quantity);
        movement.setUnitCost(unitCost);
        movement.setTotalCost(quantity.multiply(unitCost));
        movement.setSourceType(sourceType);
        movement.setSourceId(sourceId);
        movement.setAdjustmentReason(reason);
        movement.setStatus("COMPLETED");
        movement.setCreatedBy(createdBy);
        
        movementRepository.save(movement);
        log.debug("Created stock movement: {} for product: {}", transactionType, productId);
    }
    
    private String generateTransactionNumber(String type) {
        return type.substring(0, 3).toUpperCase() + "-" + System.currentTimeMillis();
    }
}

