package com.easyops.inventory.controller;

import com.easyops.inventory.dto.StockAllocationRequest;
import com.easyops.inventory.dto.StockAdjustmentRequest;
import com.easyops.inventory.dto.StockIssueRequest;
import com.easyops.inventory.dto.StockReceiptRequest;
import com.easyops.inventory.entity.Stock;
import com.easyops.inventory.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/stock")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Management", description = "Stock level and movement management APIs")
@CrossOrigin(origins = "*")
public class StockController {
    
    private final StockService stockService;
    
    @GetMapping
    @Operation(summary = "Get stock levels")
    public ResponseEntity<List<Stock>> getStock(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) UUID warehouseId) {
        log.info("GET /api/inventory/stock - org: {}, product: {}, warehouse: {}", organizationId, productId, warehouseId);
        
        List<Stock> stock;
        if (productId != null) {
            stock = stockService.getStockByProduct(organizationId, productId);
        } else if (warehouseId != null) {
            stock = stockService.getStockByWarehouse(organizationId, warehouseId);
        } else {
            stock = stockService.getStockByOrganization(organizationId);
        }
        
        return ResponseEntity.ok(stock);
    }
    
    @GetMapping("/available")
    @Operation(summary = "Get available quantity for product in warehouse")
    public ResponseEntity<Map<String, BigDecimal>> getAvailableQuantity(
            @RequestParam UUID productId,
            @RequestParam UUID warehouseId) {
        log.info("GET /api/inventory/stock/available - product: {}, warehouse: {}", productId, warehouseId);
        BigDecimal quantity = stockService.getAvailableQuantity(productId, warehouseId);
        return ResponseEntity.ok(Map.of("availableQuantity", quantity));
    }
    
    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items")
    public ResponseEntity<List<Stock>> getLowStockItems(@RequestParam UUID organizationId) {
        log.info("GET /api/inventory/stock/low-stock - org: {}", organizationId);
        List<Stock> lowStock = stockService.getLowStockItems(organizationId);
        return ResponseEntity.ok(lowStock);
    }
    
    @GetMapping("/out-of-stock")
    @Operation(summary = "Get out of stock items")
    public ResponseEntity<List<Stock>> getOutOfStockItems(@RequestParam UUID organizationId) {
        log.info("GET /api/inventory/stock/out-of-stock - org: {}", organizationId);
        List<Stock> outOfStock = stockService.getOutOfStockItems(organizationId);
        return ResponseEntity.ok(outOfStock);
    }
    
    @GetMapping("/expiring")
    @Operation(summary = "Get expiring stock")
    public ResponseEntity<List<Stock>> getExpiringStock(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String beforeDate) {
        log.info("GET /api/inventory/stock/expiring - org: {}, before: {}", organizationId, beforeDate);
        
        LocalDate date = beforeDate != null ? LocalDate.parse(beforeDate) : LocalDate.now().plusDays(30);
        List<Stock> expiringStock = stockService.getExpiringStock(organizationId, date);
        return ResponseEntity.ok(expiringStock);
    }
    
    @PostMapping("/receive")
    @Operation(summary = "Receive stock into warehouse")
    public ResponseEntity<Stock> receiveStock(@Valid @RequestBody StockReceiptRequest request) {
        log.info("POST /api/inventory/stock/receive - product: {}, qty: {}", request.getProductId(), request.getQuantity());
        Stock stock = stockService.receiveStock(
                request.getOrganizationId(),
                request.getProductId(),
                request.getWarehouseId(),
                request.getQuantity(),
                request.getUnitCost(),
                request.getSourceType(),
                request.getSourceId(),
                request.getCreatedBy()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(stock);
    }
    
    @PostMapping("/issue")
    @Operation(summary = "Issue stock from warehouse")
    public ResponseEntity<Stock> issueStock(@Valid @RequestBody StockIssueRequest request) {
        log.info("POST /api/inventory/stock/issue - product: {}, qty: {}", request.getProductId(), request.getQuantity());
        Stock stock = stockService.issueStock(
                request.getOrganizationId(),
                request.getProductId(),
                request.getWarehouseId(),
                request.getQuantity(),
                request.getSourceType(),
                request.getSourceId(),
                request.getCreatedBy()
        );
        return ResponseEntity.ok(stock);
    }
    
    @PostMapping("/allocate")
    @Operation(summary = "Allocate stock for sales order")
    public ResponseEntity<Stock> allocateStock(@Valid @RequestBody StockAllocationRequest request) {
        log.info("POST /api/inventory/stock/allocate - product: {}, qty: {}", request.getProductId(), request.getQuantity());
        Stock stock = stockService.allocateStock(
                request.getOrganizationId(),
                request.getProductId(),
                request.getWarehouseId(),
                request.getQuantity(),
                request.getSalesOrderId(),
                request.getCreatedBy()
        );
        return ResponseEntity.ok(stock);
    }
    
    @PostMapping("/deallocate")
    @Operation(summary = "Deallocate stock (release reservation)")
    public ResponseEntity<Stock> deallocateStock(@Valid @RequestBody StockAllocationRequest request) {
        log.info("POST /api/inventory/stock/deallocate - product: {}, qty: {}", request.getProductId(), request.getQuantity());
        Stock stock = stockService.deallocateStock(
                request.getOrganizationId(),
                request.getProductId(),
                request.getWarehouseId(),
                request.getQuantity(),
                request.getSalesOrderId(),
                request.getCreatedBy()
        );
        return ResponseEntity.ok(stock);
    }
    
    @PostMapping("/adjust")
    @Operation(summary = "Adjust stock quantity")
    public ResponseEntity<Stock> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        log.info("POST /api/inventory/stock/adjust - product: {}, new qty: {}", request.getProductId(), request.getNewQuantity());
        Stock stock = stockService.adjustStock(
                request.getOrganizationId(),
                request.getProductId(),
                request.getWarehouseId(),
                request.getNewQuantity(),
                request.getReason(),
                request.getCreatedBy()
        );
        return ResponseEntity.ok(stock);
    }
}

