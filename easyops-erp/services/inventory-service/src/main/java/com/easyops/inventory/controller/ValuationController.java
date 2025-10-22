package com.easyops.inventory.controller;

import com.easyops.inventory.service.InventoryValuationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/valuation")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory Valuation", description = "Inventory valuation and costing APIs")
@CrossOrigin(origins = "*")
public class ValuationController {
    
    private final InventoryValuationService valuationService;
    
    @GetMapping("/total")
    @Operation(summary = "Get total inventory value for organization")
    public ResponseEntity<Map<String, Object>> getTotalInventoryValue(@RequestParam UUID organizationId) {
        log.info("GET /api/inventory/valuation/total - org: {}", organizationId);
        Map<String, Object> valuation = valuationService.calculateInventoryValue(organizationId);
        return ResponseEntity.ok(valuation);
    }
    
    @GetMapping("/by-warehouse")
    @Operation(summary = "Get inventory value by warehouse")
    public ResponseEntity<List<Map<String, Object>>> getInventoryValueByWarehouse(@RequestParam UUID organizationId) {
        log.info("GET /api/inventory/valuation/by-warehouse - org: {}", organizationId);
        List<Map<String, Object>> valuation = valuationService.getInventoryValueByWarehouse(organizationId);
        return ResponseEntity.ok(valuation);
    }
}

